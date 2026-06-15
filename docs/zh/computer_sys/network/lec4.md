# Lec 4 网络辅助拥塞控制



- D. Katabi, M. Handley, and C. Rohrs, [Congestion control for high bandwidth-delay product networks](https://web.mit.edu/6.829/www/2020/papers/xcp.pdf), SIGCOMM 2002. (Read Sections 1-3)
- [PIE Internet RFC](https://tools.ietf.org/html/draft-ietf-aqm-pie-06) (Read Sections 1-4; skim the rest).



# 论文阅读： BBR——基于拥塞的拥塞控制



BBR 之前，主流的 TCP 拥塞控制算法都是基于**丢包**（loss-based）设计的， 这一假设最早可追溯到上世纪八九十年代，那时的链路带宽和内存容量分别以 Mbps 和 KB 计，链路质量（以今天的标准来说）也很差。

三十年多后，这两个物理容量都已经增长了至少六个数量级，链路质量也不可同日而语。特别地，在现代基础设施中， **丢包和延迟不一定表示网络发生了拥塞**，因此原来的假设已经不再成立。 Google 的网络团队从这一**根本问题**出发，（在前人工作的基础上） 设计并实现了一个**基于拥塞本身**而非基于丢包或延迟的拥塞控制新算法，缩写为 BBR