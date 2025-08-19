# Lec 16 互斥

[toc]



**目标**

这篇阅读内容将并发和Promise的概念结合在一起， 探讨异步**抽象数据类型（ADT）**的上下文——一种具有异步操作的ADT，这些操作可能并发运行，并访问相同的共享（可变）表示。

我们将看到，这种并发操作带来了并发错误的风险，例如 竞态条件（race conditions） 和 死锁（deadlocks），这些错误可能会破坏 ADT 试图保证的不变量和规范。

通过推理并发代码的交错执行，并利用 **互斥（mutual exclusion）**（即代码在没有交错执行的情况下独立运行的时期），我们可以防范这些错误。

## 引例

我们考虑一个用户租借和归还书本的图书官，首先我们需要一些类型代表书和用户。

```ts
// Book 表示一本实体书籍。
// 相等操作是 ===，可安全用于集合和映射。
class Book { ... }

// User 表示图书馆的一个人类用户。
// 相等操作是 ===，可安全用于集合和映射。
class User { ... }
```

这些操作被省略了，因为我们不会对用户或书籍调用任何操作，只是用它们来表示身份。

下面是图书馆及其两个关键操作——借阅（checkout）和归还（checkin）：

```ts
// Library 表示一个可被用户借阅的可变书籍集合。
// 在任何时候，图书馆都有一组实际存在的书籍，
// 每个用户都有一组已借的书籍。
// 这些集合是相互独立的，因为一本书不可能同时出现在两个地方。
interface Library {
    /**
     * 借出 `books` 中的每本书，`user` 现在正在借阅它们。
     * 需要 `books` 中的每本书在图书馆中实际存在。
     */
    checkout(books: Array<Book>, user: User): void;

    /**
     * 归还 `books` 中的每本书，使其重新回到图书馆。
     * 如果有任何书籍曾被某个用户借走，它们现在会被归还到图书馆。
     */
    checkin(books: Array<Book>): void;
}
```

这个借阅操作的初步规范相当薄弱，我们将对此进行迭代。该操作的设计也存在一些问题，这将揭示我们在并发编程世界中面临的一些挑战。

## 同步抽象类型

让我们从实现这个弱规范开始，使用一个直接表示抽象中的集合的简单表示：

```ts
class MITLibrary implements Library {

    private inLibrary: Set<Book> = new Set();
    private borrowed: Map<User, Set<Book>> = new Map();

    // AF(inLibrary, borrowed) = 图书馆，其中
    //    实际存在的书籍是 `inLibrary` 集合，
    //    用户 u 借阅的书籍是 borrowed.get(u)

    // 表示不变量：
    //   `inLibrary` 和 `borrowed` 的书籍集合是完全独立的

    // 防止表示泄露：
    //   - 所有表示字段都是私有的；
    //   - 可变的 Set 和 Map 类型的字段不会被任何公共方法获取或返回；
    //   - Book 和 User 被客户别名化，但仅用于它们的相等操作（它们指定该操作可以安全地在集合和映射中使用）。

    private checkRep(): void {
        // 确保每本书在表示中只出现一次
        const allBooks: Set<Book> = new Set(this.inLibrary);
        this.borrowed.values().forEach((borrowedBooks: Set<Book>) => {
            borrowedBooks.forEach((book: Book) => {
                assert(!allBooks.has(book));
                allBooks.add(book);
            });
        });
    }

    public constructor() {
        this.checkRep();
    }

    /** @inheritdoc */
    public checkout(books: Array<Book>, user: User): void {
        // 借出书籍
        for (const book of books) {
            this.inLibrary.delete(book);
            this.borrowedByUser(user).add(book);
        }

        this.checkRep();
    }

    /** @inheritdoc */
    public checkin(books: Array<Book>): void {
        for (const book of books) {
            // 书籍不再借出，因此从所有借阅集合中移除
            for (const borrowedBooks of this.borrowed.values()) {
                borrowedBooks.delete(book); // 最多一个集合包含这本书
            }

            // 书籍已归还到图书馆
            this.inLibrary.add(book);
        }

        this.checkRep();
    }

    /**
     * @returns 用户借阅的可变书籍集合，
     * 如果用户以前没有借阅过书籍，则创建该集合
     */
    private borrowedByUser(user: User): Set<Book> {
        let books = this.borrowed.get(user);
        if (books === undefined) {
            books = new Set();
            this.borrowed.set(user, books);
        }
        return books;
    }
}
```

## 异步方法

使用当前的规范，图书馆的用户会很快发现一个问题：如果某本书现在不在图书馆呢？例如：

```ts
library.checkout([fellowship], bilbo);
// ... 一段时间后，Frodo来了：
library.checkout([fellowship], frodo);
```

首先 Bilbo 借走了《指环王：护戒同盟》（fellowship），然后Frodo也想借这本书。按照当前的规范，这第二次调用实际上是非法的，因为它违反了所有请求的书籍必须在图书馆中的前提条件。但Frodo怎么知道呢？即使我们给Frodo提供一个观察操作，用来检查他想借的书是否在图书馆并避免违反前提条件，他仍然得等一段时间，直到所有书籍都归还。`checkout` 对客户端来说是一个难以使用的操作。

让我们通过将 `checkout` 异步化来解决这个问题。现在，`checkout` 不再要求所有书籍在调用时就必须在图书馆中，而是会等待书籍被归还，然后再借出。等待将通过返回一个 Promise 来完成：

```ts
/**
 * 借出 `books` 中的每本书，使 `user` 成为借阅者。
 * 如果其中有任何书籍不在图书馆，等待它们归还，
 * 只有当所有书籍成功借出时，才会解决这个 Promise。
 */
checkout(books: Array<Book>, user: User): Promise<void>;
```

现在，我们可以考虑Bilbo和Frodo在各自的异步函数中运行，分别与图书馆交互，并等待 Promise：

```ts
await library.checkout([fellowship], bilbo);
// ... // Bilbo花时间读书
library.checkin([fellowship]);
await library.checkout([fellowship], frodo);
// ... // Frodo花时间读书
library.checkin([fellowship]);
```

如何实现异步 `checkout` 呢？以下是我们可以尝试的实现大纲：

```ts
public async checkout(books: Array<Book>, user: User): Promise<void> {
    // 等待所有书籍归还
    for (const book of books) {
        if (!this.inLibrary.has(book)) {
            // 书籍当前被借出
            // TODO -- 等待某个方法
        }
    }

    // 借出书籍
    for (const book of books) {
        this.inLibrary.delete(book);
        this.borrowedByUser(user).add(book);
    }

    this.checkRep();
}
```

操作的第一部分检查每本书是否在图书馆。如果都在，它立即进入第二部分，借出所有书籍并返回。

但是，如果某本书当前被借出，那么我们就到了 TODO 处。我们必须想办法等待，直到书籍被归还。

## 创建并保持一个Promise

当书籍缺失时，我们需要等待它被归还到图书馆。我们可以创建一个代表该事件的 Promise。然后，`checkout` 可以等待这个 Promise，达到等待的效果。那么，谁会去解决这个 Promise，告诉 `checkout` 可以继续执行呢？这将发生在 `checkin` 操作的主体中，在书籍被归还的时刻。

在我们深入讨论之前，我们需要再次审视一下 Promise 的抽象数据类型（ADT）。一个 ADT 由它的操作定义，那么 Promise 的操作是什么呢？到目前为止，我们只见过 `await`，它作为一个观察者。

但是，创建者呢？到目前为止，我们使用的所有 Promise（例如定时器、文件 I/O 和网页加载）都是由低级库为我们创建的。现在我们遇到的情况是，我们自己的代码需要创建一个 Promise，这个 Promise 将由我们自己代码中的某个事件来解决。没有像时钟或 I/O 系统这样的外部设备参与。所以，我们也需要能够创建 Promise。

而且，Promise 是可变的 —— 它的状态如何从挂起（pending）变为已解决（fulfilled）或已拒绝（rejected）呢？

这个问题的答案在于，Promise 有两个不同的客户端：一个是 Promise 的消费者，通过 `await` 获取其值；另一个是承诺者（promiser），即计算 Promise 值的代码。Promise 设计为只有承诺者才能访问改变 Promise 状态的 `resolve()` 和 `reject()` 操作。

承诺者所需要的是一个新的 `Promise<T>` 对象，以及它的相关变更操作，`resolve` 和 `reject`。这可以通过一个工厂函数 `Promise.withResolvers()` 来实现，它返回一个包含三个属性的记录类型：

- `promise: Promise<T>` 是新创建的 Promise
- `resolve: (t:T) -> void` 是一个变更器，用于使用值 t 解决该 Promise
- `reject: (err:Error) -> void` 是一个变更器，用于拒绝该 Promise，并给出错误信息

这个设计的一个重要后果是，只有承诺者 —— 即创建 Promise 的代码 —— 才能访问 `resolve` 和 `reject` 这些变更器。变更器不是 `Promise` 对象的公共实例方法。（`Promise` 类确实有名为 `resolve()` 和 `reject()` 的方法，但这些实际上是静态工厂方法，它们创建的是已解决或已拒绝的 Promise，而不是用于变更现有 Promise 状态的变更器。）

一个更方便的管理方式是创建一个抽象数据类型 `Deferred<T>`，它将 `Promise<T>` 和它的变更器打包在一起：

- `new Deferred<T>()` 创建一个新的 `Deferred<T>` 对象
- `deferred.promise` 是与 `Deferred` 对象相关联的 `Promise<T>`
- `deferred.resolve(t:T)` 使用值 t 解决关联的 Promise
- `deferred.reject(err:Error)` 使用给定的错误拒绝关联的 Promise

因此，`Deferred` 提供了承诺者所需的变更器。承诺者保留这个对象，以便在稍后能够变更 Promise。承诺者将关联的 Promise 值返回给 Promise 的消费者，以便在 `await` 中使用。

`Deferred` 在标准的 Node 或 JavaScript 库中并不存在，但可以很容易地通过 `Promise.withResolvers()` 来实现。

## 异步方法创建一个 Promise

我们将使用 `Deferred` 方法来创建 Promise，因为它有一个很好的特点：将 `resolve`/`reject` 变更器与 Promise 包装在一个对象中。这个 `Deferred` 对象将代表一个现实库中的熟悉概念：将书籍放置在保留队列中。当书籍最终归还到图书馆时，`checkin` 会查看该书的保留队列，并调用 `resolve()` 来解决该 Promise，从而使得等待中的 `checkout` 操作恢复。

多个用户可能在等待同一本书，因此每本书都需要一个保留队列，我们将使用数组来表示这个队列：

```ts
private holds: Map<Book, Array<Deferred<void>>>;
```

当 `checkout` 需要等待一本书时，它会创建一个 `Deferred` 对象，将其加入保留队列，并等待其 Promise。以下是新代码（已标黄）：

```ts
public async checkout(books: Array<Book>, user: User): Promise<void> {
    // 等待所有书籍被归还
    for (const book of books) {
        if ( ! this.inLibrary.has(book) ) {
            // 书籍当前已借出，所以
            // 将自己放到保留队列中并等待
            const hold = new Deferred<void>();
            this.holdsForBook(book).push(hold);
            await hold.promise;
        }
    }

    // 借出书籍
    for (const book of books) {
        this.inLibrary.delete(book);
        this.borrowedByUser(user).add(book);
    }

    this.checkRep();
}

/**
 * @returns `book` 的可变保留队列，
 * 如果队列不存在，则创建它
 */
private holdsForBook(book: Book): Array<Deferred<void>> {
    ... // 类似于 borrowedByUser() 辅助方法
}

```

## 其他实现互斥的技术

TypeScript/JavaScript 程序运行在单一进程和单线程环境中，使用合作式（非抢占式）并发在并发模块之间传递控制。在这种情况下，我们可以通过检查 `await` 点来推理并发执行顺序，并保证互斥。

相比之下，在低级系统中，如果多个线程共享相同的可变数据，情况会复杂得多。线程使用抢占式并发，这意味着一个线程可以在其计算的任何任意点中断另一个线程，而不仅仅是在 `await` 等少数几个特定地方。当你可以在任何地方被中断时，推理并发执行变得更加复杂，因此必须使用像锁、互斥量（mutex）或信号量等技术来实现互斥。抢占式并发不在 6.102 课程的讨论范围内，但你可以在 6.180 计算机系统工程和 6.181 操作系统工程中学习相关内容。

另外，值得一提的是，另一种常见的并发访问可变共享数据的方法是使用数据库。数据库系统广泛应用于分布式客户端/服务器系统，如 Web 应用。数据库通过使用事务来避免竞争条件，从而为对数据库的一系列读写提供互斥。 数据库系统课程中，你可以深入了解事务。

顺便说一下，TypeScript/JavaScript 并不是唯一支持使用 `async` 和 `await` 的合作式并发的语言。Python、Swift、Rust 和 C# 也支持这种方法。