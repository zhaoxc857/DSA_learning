// ============================================================================
// 第 13 关（进阶 2）：图的进阶算法（Kruskal 并查集 + Floyd + 拓扑排序判环）
// 对应教材：5.4.2（Kruskal） + 5.5.2（Floyd） + 5.6 问题 3（AOV 网拓扑排序）
//
// 本关核心训练：
//   Part A：并查集（含路径压缩） + Kruskal 最小生成树（稀疏图按边贪心）
//   Part B：Floyd-Warshall 全源最短路径（三重循环 k 必须在最外层！）
//   Part C：Kahn 算法拓扑排序 + 环路检测（用小顶堆确保字典序最小唯一输出）
//
// 编译评测命令（在 labs 目录下）：
//   python judge.py 13
// ============================================================================

#include <algorithm>
#include <functional>
#include <iostream>
#include <queue>
#include <utility>
#include <vector>
#include "../common/test_kit.h"

// ============================================================================
// Part A：并查集（DSU） + Kruskal 最小生成树（教材 5.4.2）
// ============================================================================

struct KEdge {
    int u; // 端点 1（0 .. n-1）
    int v; // 端点 2（0 .. n-1）
    int w; // 边权
};

struct DSU {
    std::vector<int> parent; // parent[x] 表示 x 的父节点；根节点的 parent[r] == r
};

// ----------------------------------------------------------------------------
// 任务 A1：初始化并查集
// 【函数目标】
//   将包含 n 个元素（编号 0 .. n-1）的并查集初始化为 n 个互相独立的单元素集合。
//
// 【画图与思路推导】
//   1. d.parent.resize(n);
//   2. for (int i = 0; i < n; ++i) d.parent[i] = i;
//      （每个节点的父亲指向自己，表示自己就是所在集合的根）
//
// 【边界提醒】
//   - n == 0 时 resize(0) 安全合法。
// ----------------------------------------------------------------------------
void dsuInit(DSU& d, int n) {
    // TODO: 初始化 parent[i] = i (0 <= i < n)
    (void)d;
    (void)n;
}

// ----------------------------------------------------------------------------
// 任务 A2：查找元素所属集合的根节点（带路径压缩）
// 【函数目标】
//   返回元素 x 所在集合的代表元（根节点），并在回溯途中将路径上所有节点直接挂到根节点下。
//
// 【画图与思路推导】
//   1. 递归出口：如果 d.parent[x] == x，说明 x 本身就是根，直接返回 x。
//   2. 递归并路径压缩：
//      d.parent[x] = dsuFind(d, d.parent[x]);
//      return d.parent[x];
//
// 【边界提醒】
//   - 一定要写赋值 `d.parent[x] = dsuFind(...)`，如果只写 `return dsuFind(d, d.parent[x]);`
//     就没有做到路径压缩，树可能退化成一条长链！
// ----------------------------------------------------------------------------
int dsuFind(DSU& d, int x) {
    // TODO: 实现带路径压缩的并查集查找
    (void)d;
    (void)x;
    return -1;
}

// ----------------------------------------------------------------------------
// 任务 A3：合并两个元素所在的集合
// 【函数目标】
//   若 a 和 b 已在同一个集合，不做合并并返回 false；
//   若不在同一个集合，合并两集合并返回 true。
//
// 【画图与思路推导】
//   1. 分别找根：int ra = dsuFind(d, a); int rb = dsuFind(d, b);
//   2. 若 ra == rb，说明在同一连通分量（若加这条边会成环！），返回 false。
//   3. 否则令 d.parent[ra] = rb; 并返回 true。
//
// 【边界提醒】
//   - 合并的一定是两个【根节点】ra 和 rb，千万不要写成 d.parent[a] = b！
// ----------------------------------------------------------------------------
bool dsuUnion(DSU& d, int a, int b) {
    // TODO: 实现并查集合并，同集合返回 false，合并成功返回 true
    (void)d;
    (void)a;
    (void)b;
    return false;
}

// ----------------------------------------------------------------------------
// 任务 A4：Kruskal 最小生成树算法
// 【函数目标】
//   给定无向带权图（顶点数 n，编号 0..n-1，边集 edges），返回最小生成树的总边权。
//   特殊约定：
//     - 若 n <= 1，图不需要任何边就已连通，返回 0。
//     - 若图不连通（无法选出 n - 1 条边），返回 -1。
//
// 【画图与思路推导】
//   1. 若 n <= 1，直接返回 0。
//   2. 按边权 w 升序排序 edges：
//      std::sort(edges.begin(), edges.end(),
//                [](const KEdge& a, const KEdge& b) { return a.w < b.w; });
//   3. 初始化并查集 DSU d; dsuInit(d, n);
//      准备 int totalWeight = 0, picked = 0;
//   4. 依次扫描排序后的每条边 e：
//      - 调用 dsuUnion(d, e.u, e.v)：
//        如果返回 true（不构成环），则 totalWeight += e.w; ++picked;
//        当 picked == n - 1 时已经凑齐生成树，可提前 break！
//   5. 若 picked == n - 1 返回 totalWeight，否则返回 -1。
//
// 【边界提醒】
//   - 图可能包含自环（u == v）或重边（u, v 之间多条不同权值的边）：
//     排序 + dsuUnion 会自动跳过自环和更贵的重边，无需额外特判！
//   - 图不连通时循环结束后 picked < n - 1，必须返回 -1，不能返回部分森林权值和。
// ----------------------------------------------------------------------------
int kruskalMST(int n, std::vector<KEdge> edges) {
    // TODO: 实现 Kruskal 最小生成树算法
    (void)n;
    (void)edges;
    return -1;
}

// ============================================================================
// Part B：Floyd-Warshall 全源最短路径（教材 5.5.2）
// ============================================================================

const int INF = 1000000000;

// ----------------------------------------------------------------------------
// 任务 B1：Floyd 多源最短路径
// 【函数目标】
//   给定 n x n 的初始距离矩阵 dist（顶点 0..n-1，dist[i][i] = 0，无直连边为 INF），
//   计算任意两点 (i, j) 之间的最短路径长度，返回更新后的 n x n 距离矩阵。
//
// 【画图与思路推导】
//   动态规划含义：外层枚举到 k 时，dist[i][j] 表示「只允许经过编号 0..k 的顶点作中转」时
//   从 i 到 j 的最短路长度。
//   1. 最外层循环枚举中转点：for (int k = 0; k < n; ++k)
//   2. 中间层循环枚举起点：  for (int i = 0; i < n; ++i)
//        （小优化：若 dist[i][k] >= INF 可直接 continue）
//   3. 最内层循环枚举终点：  for (int j = 0; j < n; ++j)
//        若 dist[i][k] < INF && dist[k][j] < INF：
//          若 dist[i][k] + dist[k][j] < dist[i][j]：
//            dist[i][j] = dist[i][k] + dist[k][j];
//   4. 返回 dist。
//
// 【边界提醒】
//   - 【头号易错点】中转点 k 必须在最外层（k-i-j）！若误写成 i-j-k，多跳中转路径会松弛不全！
//   - 【二号易错点】必须判断 dist[i][k] < INF && dist[k][j] < INF 再相加，
//     防止 INF + INF 溢出或产生错误值。
//   - 不可达点对在结束后应仍然保持 INF。
// ----------------------------------------------------------------------------
std::vector<std::vector<int>> floydAllPairs(int n, std::vector<std::vector<int>> dist) {
    // TODO: 实现 Floyd 全源最短路（切记 k 在最外层且判 INF 防溢出）
    (void)n;
    (void)dist;
    return std::vector<std::vector<int>>();
}

// ============================================================================
// Part C：AOV 网拓扑排序 + 环路检测（教材 5.6 问题 3，Kahn 算法）
// ============================================================================

// ----------------------------------------------------------------------------
// 任务 C1：拓扑排序（Kahn 算法 + 小顶堆唯一序）
// 【函数目标】
//   给定有向图：n 个顶点（0 .. n-1）和若干有向边 (u, v)，表示 u 必须排在 v 之前。
//   返回满足所有先后约束的拓扑序列；
//   - 若同一时刻有多个入度为 0 的顶点可选，优先选【编号最小】的（用小顶堆确保结果唯一）。
//   - 若图中存在环（无法排完全部 n 个顶点），返回空数组 {}。
//
// 【画图与思路推导】
//   1. 建邻接表 adj(n) 和入度数组 indeg(n, 0)：
//      遍历 edges 中每条边 (u, v)：adj[u].push_back(v); indeg[v]++;
//   2. 准备小顶堆：
//      std::priority_queue<int, std::vector<int>, std::greater<int>> pq;
//      将所有 indeg[i] == 0 的顶点 i 入堆。
//   3. 准备结果数组 std::vector<int> order;
//      当 !pq.empty() 时：
//        - 取出堆顶 u = pq.top(); pq.pop();
//        - order.push_back(u);
//        - 遍历 u 的每个出边邻居 v：
//            --indeg[v];
//            若 indeg[v] == 0，则 pq.push(v);
//   4. 判环：若 static_cast<int>(order.size()) != n，说明有顶点卡在环里入度永远降不到 0，
//      返回空 vector {}；否则返回 order。
//
// 【边界提醒】
//   - 自环 (u, u) 会让 u 的入度至少为 1，永远无法入堆，order.size() < n，自然返回 {}。
//   - 空图 n == 0 直接返回空 vector {}。
//   - 存在多连通分量或孤立点时，所有入度为 0 的点在初始化阶段都会入堆，不会遗漏。
// ----------------------------------------------------------------------------
std::vector<int> topoSort(int n, const std::vector<std::pair<int, int>>& edges) {
    // TODO: 实现 Kahn 算法拓扑排序（用小顶堆保证按编号从小到大输出，有环返回 {}）
    (void)n;
    (void)edges;
    return std::vector<int>();
}

// ================================= 自动测试套 =================================

static bool checkMatrixShape(const std::vector<std::vector<int>>& m, int n) {
    if (static_cast<int>(m.size()) != n) return false;
    for (int i = 0; i < n; ++i) {
        if (static_cast<int>(m[i].size()) != n) return false;
    }
    return true;
}

int main() {
    labtest::beginLab("第 13 关：图的进阶算法（Kruskal + Floyd + 拓扑排序）");

    // -------------------- Part A 测试：并查集 + Kruskal --------------------
    {
        DSU d;
        dsuInit(d, 5);
        bool initOk = (d.parent.size() == 5);
        for (int i = 0; initOk && i < 5; ++i) {
            if (d.parent[i] != i) initOk = false;
        }
        labtest::expectTrue("A1. 并查集初始化每个节点 parent[i] == i", initOk,
                            "检查 dsuInit：应 resize(n) 并令 parent[i] = i");

        bool u1 = dsuUnion(d, 0, 1);
        bool u2 = dsuUnion(d, 1, 2);
        bool u3 = dsuUnion(d, 0, 2); // 已同集合
        labtest::expectTrue("A2. 合并不同集合返回 true，重复合并同集合返回 false",
                            u1 && u2 && !u3,
                            "检查 dsuUnion：ra == rb 时必须返回 false，否则合并根节点并返回 true");

        // 测试路径压缩：手动构造链 0 -> 1 -> 2 -> 3 -> 4
        DSU chain;
        chain.parent = {1, 2, 3, 4, 4};
        int root0 = dsuFind(chain, 0);
        bool compressed = (root0 == 4 && chain.parent[0] == 4 && chain.parent[1] == 4 && chain.parent[2] == 4);
        labtest::expectTrue("A3. dsuFind 正确找到根 4 并完成路径压缩", compressed,
                            "检查 dsuFind：需写 d.parent[x] = dsuFind(d, d.parent[x]) 将路径节点直接挂到根下");

        // Kruskal 经典 6 点连通图（MST 边：0-2(1), 3-5(2), 1-4(3), 2-5(4), 2-1(5) -> 总权 15）
        std::vector<KEdge> e1 = {
            {0, 1, 6}, {0, 2, 1}, {0, 3, 5},
            {1, 2, 5}, {1, 4, 3},
            {2, 3, 5}, {2, 4, 6}, {2, 5, 4},
            {3, 5, 2}, {4, 5, 6}
        };
        labtest::expectEqInt("A4. Kruskal 经典 6 点连通图最小生成树总权为 15",
                             15, kruskalMST(6, e1),
                             "检查 kruskalMST：是否按 w 升序排序、用 dsuUnion 选满 n-1 条边并累加权值");

        // 含重边（平行边）和自环的 4 点图：最优边 0-1(2), 1-2(3), 2-3(4) -> 总权 9
        std::vector<KEdge> e2 = {
            {0, 0, 1},           // 自环（不可选！）
            {0, 1, 10}, {0, 1, 2}, // 重边，应选权为 2 的
            {1, 2, 3},  {1, 2, 8},
            {2, 3, 4},  {0, 3, 9}
        };
        labtest::expectEqInt("A5. Kruskal 含重边与自环的 4 点图总权为 9",
                             9, kruskalMST(4, e2),
                             "检查 kruskalMST：自环 (u==v) 和更贵的重边都会被 dsuUnion 判同集合跳过");

        // 非连通图（0-1 连通，2-3 连通，中间断开）
        std::vector<KEdge> e3 = {{0, 1, 2}, {2, 3, 5}};
        labtest::expectEqInt("A6. Kruskal 非连通图返回 -1",
                             -1, kruskalMST(4, e3),
                             "检查 kruskalMST：选出的边数 picked < n - 1 时必须返回 -1");

        // 单点与空图边界
        labtest::expectEqInt("A7. Kruskal 单点图 (n=1) 返回 0",
                             0, kruskalMST(1, {}),
                             "检查 kruskalMST：n <= 1 时不需要任何边，直接返回 0");
        labtest::expectEqInt("A8. Kruskal 空图 (n=0) 返回 0",
                             0, kruskalMST(0, {}),
                             "检查 kruskalMST：n <= 1 边界应返回 0");
    }

    // -------------------- Part B 测试：Floyd 多源最短路 --------------------
    {
        // 用例 1：专门检测「k 必须在最外层」的多跳松弛图！
        // 0 -> 3 (1), 3 -> 2 (1), 2 -> 1 (1), 另有贵直连 0 -> 1 (50)
        // 若误把循环顺序写成 i-j-k，计算 dist[0][1] 时 dist[0][2] 尚未算出来，会导致 dist[0][1] 停留在 50！
        int n1 = 4;
        std::vector<std::vector<int>> g1(n1, std::vector<int>(n1, INF));
        for (int i = 0; i < n1; ++i) g1[i][i] = 0;
        g1[0][3] = 1;
        g1[3][2] = 1;
        g1[2][1] = 1;
        g1[0][1] = 50;

        std::vector<std::vector<int>> r1 = floydAllPairs(n1, g1);
        bool shape1 = checkMatrixShape(r1, n1);
        labtest::expectTrue("B1. Floyd 多跳绕路 0->3->2->1 正确松弛 dist[0][1] == 3",
                            shape1 && r1[0][1] == 3 && r1[0][2] == 2 && r1[3][1] == 2,
                            "检查 floydAllPairs：若 dist[0][1] 仍为 50，说明中转点 k 写到了内层！k 必须在最外层！");
        labtest::expectTrue("B2. Floyd 有向图反向不可达保持 INF（不溢出）",
                            shape1 && r1[1][0] == INF && r1[1][3] == INF && r1[2][0] == INF,
                            "检查 floydAllPairs：相加前必须判断 dist[i][k] < INF && dist[k][j] < INF");

        // 用例 2：5 点一般带权有向图（含完全不可达孤立点 4）
        int n2 = 5;
        std::vector<std::vector<int>> g2(n2, std::vector<int>(n2, INF));
        for (int i = 0; i < n2; ++i) g2[i][i] = 0;
        g2[0][1] = 3;  g2[0][2] = 10;
        g2[1][2] = 2;  g2[1][3] = 8;
        g2[2][3] = 1;  g2[3][0] = 4;
        std::vector<std::vector<int>> r2 = floydAllPairs(n2, g2);
        bool shape2 = checkMatrixShape(r2, n2);
        labtest::expectTrue("B3. Floyd 5 点带环有向图关键点对最短路正确",
                            shape2 && r2[0][3] == 6 && r2[1][0] == 7 && r2[2][1] == 8 && r2[0][0] == 0,
                            "检查 floydAllPairs：0->1->2->3=6, 1->2->3->0=7, 2->3->0->1=8");
        labtest::expectTrue("B4. Floyd 孤立点 4 与其他所有点互不可达（保持 INF）",
                            shape2 && r2[0][4] == INF && r2[4][0] == INF && r2[4][4] == 0,
                            "检查 floydAllPairs：不可达点对不能被错误修改，且对角线保持 0");

        // 用例 3：单点图边界
        std::vector<std::vector<int>> g3 = {{0}};
        std::vector<std::vector<int>> r3 = floydAllPairs(1, g3);
        labtest::expectTrue("B5. Floyd 单点图 (1x1) 返回 [[0]]",
                            checkMatrixShape(r3, 1) && r3[0][0] == 0,
                            "检查 floydAllPairs 单点边界");
    }

    // -------------------- Part C 测试：拓扑排序 + 判环 --------------------
    {
        // 用例 1：DAG 唯一序（多个入度为 0 的点按编号升序出队）
        // 边：2->3, 3->1, 4->0, 4->1, 5->0, 5->2
        // 初始入度 0：4, 5 -> 选 4 -> 选 5 -> 解锁 0, 2 -> 选 0 -> 选 2 -> 解锁 3 -> 选 3 -> 解锁 1 -> 选 1
        // 期望：[4, 5, 0, 2, 3, 1]
        std::vector<std::pair<int, int>> dag1 = {
            {2, 3}, {3, 1}, {4, 0}, {4, 1}, {5, 0}, {5, 2}
        };
        labtest::expectEqVec("C1. DAG 多零入度点按编号升序输出唯一拓扑序",
                             {4, 5, 0, 2, 3, 1}, topoSort(6, dag1),
                             "检查 topoSort：必须使用小顶堆 priority_queue<int, vector<int>, greater<int>> 保证编号小的先出");

        // 用例 2：多连通分量 + 孤立点
        // 点 0..4，边：3->1, 4->2，孤立点 0
        // 初始入度 0：0, 3, 4 -> 选 0 -> 选 3（解锁 1）-> 选 1 -> 选 4（解锁 2）-> 选 2
        // 期望：[0, 3, 1, 4, 2]
        std::vector<std::pair<int, int>> dag2 = {{3, 1}, {4, 2}};
        labtest::expectEqVec("C2. 多连通分量与孤立点 DAG 拓扑序",
                             {0, 3, 1, 4, 2}, topoSort(5, dag2),
                             "检查 topoSort：所有入度为 0 的点都应入堆，解锁新节点后小顶堆会自动挑最小编号");

        // 用例 3：含环有向图（3->0->1->2->0）返回空
        std::vector<std::pair<int, int>> cyc1 = {
            {3, 0}, {0, 1}, {1, 2}, {2, 0}
        };
        labtest::expectEqVec("C3. 含有向环的图返回空数组 {}",
                             {}, topoSort(4, cyc1),
                             "检查 topoSort：循环结束后若 order.size() != n，必须返回空 vector {}");

        // 用例 4：含自环的图返回空
        std::vector<std::pair<int, int>> cyc2 = {{0, 1}, {1, 1}};
        labtest::expectEqVec("C4. 含自环 (1->1) 的图返回空数组 {}",
                             {}, topoSort(2, cyc2),
                             "检查 topoSort：自环会导致节点 1 入度永远 >= 1，最终无法排完 2 个点，应返回 {}");

        // 用例 5：单点与空图边界
        labtest::expectEqVec("C5. 单点无边返回 [0]", {0}, topoSort(1, {}),
                             "检查 topoSort 单点边界");
        labtest::expectEqVec("C6. 空图 (n=0) 返回 {}", {}, topoSort(0, {}),
                             "检查 topoSort 空图边界");
    }

    return labtest::endLab();
}
