# Lec 22 内核可扩展性

阅读论文

[The BSD Packet Filter: A New Architecture for User-level Packet Capture, 93](https://www.tcpdump.org/papers/bpf-usenix93.pdf)

Berkeley Packet Filter 在 Linux kernel 中被广泛使用，而且用途远不止网络过滤，如果你好奇，可以阅读文章 《[A thorough introduction to eBPF](https://lwn.net/Articles/740157/)》，了解 Linux 内核使用 BPF 的一些方式。

由于 BPF 过滤器指令来自任意应用程序，内核不能信任这些指令是“行为良好”的（well-behaved）。

问题是内核如何确保过滤器不会访问任意内存？过滤器不会无限运行？并且性能开销尽可能低？
