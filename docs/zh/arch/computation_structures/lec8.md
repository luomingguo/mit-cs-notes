# Lec 8 Bluespec 硬件综合

## 接口与硬件信号关系

![image-20250429210202541](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/6810cdd224655.png)

下面定义了一个名为`GCD`的接口，它表示一个模块的“类型”或“对外可见的功能”。

```verilog
interface GCD;
  method Action start(Bit#(32) a, Bit#(32) b);
  method ActionValue(Bit#(32)) getResult;
endinterface
```

- `start` 是一个带两个 32 位输入参数的 Action 方法，没有返回值：
  - 表示启动 GCD（最大公约数）计算。
  - 类型是 `Action`：说明它有“副作用”但不返回数据（比如启动一个内部计算流程）。
- `getResult` 是一个 ActionValue 方法，返回一个 32 位整数:
  - 表示获取计算结果。
  - 类型是 `ActionValue(Bit#(32))`：说明这是一个带返回值的动作方法，既有副作用也会返回数据。

模块的输入输出端口是由它的接口（interface）定义决定的。比如在上面这个接口中：

- `start(a, b)` 是两个输入；

- `getResult()` 是一个输出（返回一个值）；

接口中定义的方法，决定了模块如何与外界通信。

- `Read` 方法 就是那种没有副作用、没有输入参数，只是读取内部状态的方法
- `Action` 方法（比如 `start`）代表的是执行一个动作（启动、写入等），没有返回值，所以它不会在硬件中生成数据输出线。相应地，Action 方法只会有输入和 enable 信号，而不会有输出数据通道
- `ActionValue`方法有ready，enable、输出数据线以及可能的输入信号线

### 示例：GCD的实现

```verilog
module mkGCD (GCD);
Reg#(Bit#(32)) x <- mkReg(0);
Reg#(Bit#(32)) y <- mkReg(0);
Reg#(Bool) busy <- mkReg(False);
rule ged;
  if (x >= y) begin
    x <= x - y;            // 减法步骤
  end else if (x != 0) begin
    x <= y; y <= x;        // 交换 x 和 y
  end
endrule

method Action start(Bit#(32) a, Bit#(32) b) if (!busy);
  x <= a;
  y <= b;
  busy <= True;
endmethod

endmodule
```



![image-20250429230615513](https://tc-1258979383.cos.ap-guangzhou.myqcloud.com/image-20250429230615513.png)