# Lec 3 C语言的数组&字符串&结构体

[[toc]]

## 数组

C 里的数组（*array*）是一段连续的内存，长度固定，定义时需指定类型和长度。

声明数组会做两件事:为数组分配内存；创建一个指针，通过它访问这段内存。数组是一个固定指针，不能重新赋值。C 不做越界检查，用指针访问数组时可能读到内存中未知的部分，这是潜在的 bug 来源。

把数组传入函数时，函数实际看到的只是数组的首地址指针，无法从中得知数组长度，所以在函数内部没有内在办法知道数组有多大，长度通常需要额外作为参数传入。

C 中所有函数参数都是按值传递(passed by value)，传进去的是副本而非原件。

初始化方法：

- `int x[] = {1， 2， 3， 4};` 构成4个int长的长度数组，并取名为x
- `int y[10];`  创建一个10个int长度的数组，取名为y（但是没有声明其值）
- `int z[5] = {1};`  创建5个int长度的数组，取名为z；下标为0的元素是1，其余为0
- `char a[10] = {'t'， 'h'， 'e'， ' '， 'c'， 'a'， 't'， '.'};`  10个char长度的数组，结尾有两个`null`
- `char b[] = "the cat.";`   9个长度为char的数组，结尾跟着`null`



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题1</strong>　下面程序会打印什么？</div>

![image-20260613093753037](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613093753037.png)



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题2</strong>　下面程序会打印什么？</div>

![image-20260613094403367](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613094403367.png)



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题3</strong>　下面程序会打印什么？</div>

![image-20260613094631775](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613094631775.png)

从我的macbook m1 64位程序来说，得到72。 因为，sizeof(ai) 得到的是8，因此循环计算了8次。



如果是32位机器，下面打印如图

![image-20260613095622406](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613095622406.png)

---

`sizeof` 给出一个数据对象在内存中占用的字节数，它不是函数，而是一个运算符。在编译期就被替换成结果。因为它在编译期求值，所以当数组作为参数传入函数后，函数内对参数用 `sizeof` 得到的是指针的大小，而不是整个数组的大小。同样，没有任何内在方式能在运行期得知数组真实长度。



## 字符串

字符串在 C 里是字符数组（char array），用一个常量指针表示，采用 ASCII 编码，以空字符 `'\0'`（null char）标记结尾。ASCII 用 8 位，共 256 种可能，实际只用了前 128 个。注意:`'A'`（单引号）是字符 65，`"A"`（双引号）是字符串。函数读取字符串时会一直读到遇见 `'\0'` 为止。



### 字符串函数

- `strlen` 返回字符串长度（不含 `'\0'`，与 `sizeof` 不同）。

- `strcpy` 把源串复制到目标串直到遇到 `'\0'`，若目标空间小于源串会溢出（overflow）并破坏相邻内存；

  - `strncpy` 最多复制 n 个字符，控制更精确。

- `strcat` 把源串拼接到目标串末尾（找到末尾`\0`开始写入），同样可能溢出；

  - `strncat` 最多拼接到第 n 个字符。

- `strcmp` 比较两个字符串:相等返回 0；在第一个不同的字符处，若 s1 的字符 ASCII 大于 s2 则返回正数，小于则返回负数。

  - `strncmp` 最多比较 n 个字符。

- `strchr` 查找某字符在串中第一次出现的位置，返回指向该处的指针，找不到返回 NULL。

  - `strrchr` 查找最后一次出现。前者找到就停，后者必须扫描完整串

- `sprintf` 类似 printf，但把格式化结果写入一个字符串而非终端。返回值是本次写入的字符数

- `strstr`:在字符串中查找子串。 `strstr(haystack， needle)` 在字符串 haystack 里查找子串 needle 第一次出现的位置，找到就返回指向该位置的指针，找不到返回 NULL。

  - strrchr:从后往前找字符，意味着找最后一次出现的位置

- `strtok`： 把字符串按分隔符切成多段。它的用法比较特殊:第一次调用时传入要切割的字符串;后续每次调用传 NULL，表示继续切割同一个字符串，直到切完返回 NULL。strtok 有两个需要特别注意的地方。

  ```c
  // strtok(str， delimiters)
  
  char str[] = "Hello，World，Foo";
  char *token = strtok(str， "，");     // 第一次调用，传入 str
  while (token != NULL) {
      printf("%s\n"， token);
      token = strtok(NULL， "，");      // 后续调用传 NULL
  }
  // 依次输出:
  // Hello
  // World
  // Foo
  ```

  - 第一，它会修改原字符串:每次切割时，strtok 会把找到的分隔符直接替换成 `'\0'`，所以原始字符串会被破坏;如果你之后还要用原串，应该先拷贝一份再传给 strtok。
  - 第二，它内部维护了一个静态指针(static pointer)来记录上次切割到了哪个位置，这就是为什么后续调用传 NULL 它还能接着往下切;但这也意味着 strtok 不是线程安全的——如果两个地方同时在用 strtok 切不同的字符串，它们会互相干扰。

- `atoi`： 将字符串转换成 `int` 类型



---

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong>例题4</strong>　把 0 到 999 这一千个数字，用空格分隔，拼接成一个很长的字符串，存进全局字符数组 totes 里，最后打印出来 </div>

![image-20260613103221202](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20260613103221202.png)

分析： 第一个版本性能弱，因为每次调用 `strcat` 都重复需要从头开始扫描找到null的位置。

第二个版本更好，利用`sprintf`的返回值是每次写入的字符数的特性，将tally作为游标。

-----





## 结构体

结构体类似 Python 里的类，但只能包含变量（成员），不包含函数。用 `.` 访问成员;为避免直接复制大型结构体（参数按值传递会产生大量拷贝），通常传指针;通过指针访问成员时先解引用再取成员，可用 `(*ptr).member` 或更常用的 `ptr->member`。

C 中所有函数参数都是按值传递，结构体也不例外。这意味着把结构体直接传进函数时，整个结构体会被完整复制一份，函数内部操作的是副本，对原件没有任何影响。如果想让修改生效，一种办法是让函数返回修改后的结构体，再覆盖原来的变量：

```c
our_course = make_subject2(our_course);
```

但这种做法有两个代价：传入时要复制一遍，返回时又要复制一遍，既浪费时间又浪费内存，结构体越大开销越明显。

更好的做法是传指针。和其它类型一样，结构体也可以有指向它的指针。通过指针，函数拿到的是结构体在内存中的地址，可以直接修改原件，不需要任何复制，相当于间接实现了按引用传递。

```c
void make_subject3(struct Subject *s);
make_subject3(&our_course);  // 传入 our_course 的地址
```

这样 make_subject3 内部通过指针 s 修改的就是 our_course 本身，函数返回后 our_course 的值已经被改好了，不需要再用返回值覆盖



通过指针访问结构体成员时，需要先解引用（dereference）再取成员。写法上有两种等价形式

- `(*s).units = 12; `  // 因为`.`的优先级比`*`高
- `s->units = 12;` // 但写起来更简洁，实际代码中几乎都用这种形式



**结构体的初始化**

```c
// 声明但没有初始化
struct Subject our_course;
// 声明并且初始化
struct Subject other_course = {9, 12, "9.01: Intro Brain Stuff", 100};
// 声明并初始化
struct Subject other_course = {.dept=9, .units=12, .name="9.01: Intro Brain Stuff", .num_students=100};
```





# 例题



<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Example 1 </strong> int[10] vals = {0, 3, 6, 9,12, 15, 18, 21, 24, 27} </div>

Sol： `*(&vals[7]-2)` =  `val[7]`这个地址往回退两个元素，得到值为 15

<div style="border-left: 4px solid #e05c5c; background: #fdeeee; padding: 10px 15px; margin: 10px 0; border-radius: 4px;"> <strong> Example 2 </strong> int* x = (int*) 0; x = x + 3; 问 x的值是多少</div>

Sol：每个int类型元素需要4字节，因此， `x = x + 3 = x + 3(4) = 12`
