// ============================================================================
// 第 09 关：图遍历与最短路（邻接表 DFS/BFS + 邻接矩阵 Prim + Dijkstra）
// 对应笔记：《05-图.md》5.2 ~ 5.5
//
// 本关核心训练：
//   1. 用邻接表实现全图 BFS（队列）与全图 DFS（递归），正确处理非连通图与孤立点
//   2. 用邻接矩阵实现 Prim 最小生成树算法（并检测图不连通）
//   3. 用邻接表实现 Dijkstra 单源最短路径（安全处理不可达顶点、自环与平行边）
//
// 编译评测命令（在 labs 目录下）：
//   python judge.py 09
// ============================================================================

#include <iostream>
#include <queue>
#include <vector>
#include "../common/test_kit.h"

// 用 1e9 表示“无穷大”（无边 / 不可达）
// 注意：不要用 INT_MAX，否则做 dist[u] + w 时非常容易整数溢出！
const int INF = 1000000000;

struct Edge {
    int to;      // 邻接顶点编号（0 .. n-1）
    int weight;  // 边权（无权图默认填 1）
};

struct Graph {
    int n;                               // 顶点总数，顶点编号为 0 .. n-1
    std::vector<std::vector<Edge>> adj;  // 邻接表：adj[u] 存从 u 出发的所有边
};

// -------------------- 辅助建图函数（已实现，可直接阅读参考） --------------------

Graph makeGraph(int n) {
    Graph g;
    g.n = n;
    g.adj.assign(n, std::vector<Edge>());
    return g;
}

void addDirectedEdge(Graph& g, int u, int v, int w = 1) {
    Edge e;
    e.to = v;
    e.weight = w;
    g.adj[u].push_back(e);
}

void addUndirectedEdge(Graph& g, int u, int v, int w = 1) {
    addDirectedEdge(g, u, v, w);
    addDirectedEdge(g, v, u, w);
}

// ============================ 待你实现的函数区域 ============================

// ----------------------------------------------------------------------------
// 任务 1：全图广度优先搜索（BFS）
// 【函数目标】
//   对图 g 执行广度优先搜索，返回所有顶点的访问序列。
//   参数 g：顶点编号 0 .. g.n-1，各顶点的邻接表 adj[u] 存放邻接边。
//   返回值：包含全部 g.n 个顶点的访问顺序（空图返回空 vector）。
//
// 【画图与思路推导】
//   1. 准备 visited(g.n, false)、结果数组 result 和队列 std::queue<int> q。
//   2. 外层循环 for (int start = 0; start < g.n; ++start)：
//      如果 visited[start] 还是 false，说明发现了一个新的连通分量！
//      立刻标记 visited[start] = true 并把 start 入队。
//   3. 当队列 q 非空时：
//      - 取出队头 u（q.front(); q.pop();），把 u 放入 result。
//      - 遍历 g.adj[u] 中的每条边 e，设邻居 v = e.to：
//        如果 !visited[v]，立刻标记 visited[v] = true 并 q.push(v)。
//
// 【边界提醒】
//   - 空图（g.n == 0）直接返回空 vector。
//   - 必须在【入队时】就标记 visited[v] = true，不要等到出队才标记，
//     否则同一个顶点会被多个邻居重复入队！
//   - 必须写外层循环扫遍 0..g.n-1，不能只从 0 开始跑一次 BFS，否则非连通图会漏点！
// ----------------------------------------------------------------------------
std::vector<int> bfsAll(const Graph& g) {
    // TODO: 实现全图 BFS（记得处理非连通图与孤立点）
    (void)g;
    return std::vector<int>();
}

// ----------------------------------------------------------------------------
// 任务 2（辅助）：从顶点 u 出发的递归深度优先搜索
// 【函数目标】
//   从尚未访问的顶点 u 出发，按邻接表顺序递归访问当前连通分量内所有可达顶点。
//   参数：图 g、当前顶点 u、已访问标记数组 visited、结果序列 result。
//
// 【画图与思路推导】
//   1. 标记 visited[u] = true，并把 u 加入 result。
//   2. 遍历 g.adj[u] 的每条边 e，设邻居 v = e.to：
//      如果 !visited[v]，递归调用 dfsFrom(g, v, visited, result)。
//
// 【边界提醒】
//   - 一定要在递归邻居【之前】标记 visited[u] = true，否则遇到环会无限递归栈溢出！
// ----------------------------------------------------------------------------
void dfsFrom(const Graph& g, int u, std::vector<bool>& visited, std::vector<int>& result) {
    // TODO: 实现单连通分量递归 DFS
    (void)g;
    (void)u;
    (void)visited;
    (void)result;
}

// ----------------------------------------------------------------------------
// 任务 2（主函数）：全图深度优先搜索（DFS）
// 【函数目标】
//   对整张图 g 执行深度优先搜索，返回所有顶点的访问序列。
//   参数 g：邻接表图（0 .. g.n-1）。
//   返回值：包含全部 g.n 个顶点的访问顺序（空图返回空 vector）。
//
// 【画图与思路推导】
//   1. 准备 visited(g.n, false) 和结果数组 result。
//   2. 外层循环 for (int start = 0; start < g.n; ++start)：
//      如果 !visited[start]，调用 dfsFrom(g, start, visited, result)。
//   3. 返回 result。
//
// 【边界提醒】
//   - 空图（g.n == 0）直接返回空 vector。
//   - 非连通图中的孤立点和其他连通分量必须全部被访问到。
// ----------------------------------------------------------------------------
std::vector<int> dfsAll(const Graph& g) {
    // TODO: 调用 dfsFrom 实现全图 DFS（记得外层循环覆盖所有连通分量）
    (void)g;
    return std::vector<int>();
}

// ----------------------------------------------------------------------------
// 任务 3：Prim 最小生成树算法（邻接矩阵版）
// 【函数目标】
//   给定 n 个顶点（编号 0..n-1）的无向带权图邻接矩阵 mat，求最小生成树（MST）的总权值。
//   参数 n：顶点数。
//   参数 mat：n x n 矩阵，mat[u][v] == INF 表示无边，mat[i][i] == 0。
//   返回值：
//     - 若 n == 0，返回 0；
//     - 若图连通，返回最小生成树的边权之和；
//     - 若图不连通（无法生成包含全部 n 个顶点的生成树），返回 -1。
//
// 【画图与思路推导】
//   1. 特判：如果 n <= 0，返回 0。
//   2. 准备两个长度为 n 的数组：
//      - inMST(n, false)：顶点是否已加入生成树集合 U
//      - lowCost(n, INF)：每个未入树顶点到集合 U 的最小边权
//   3. 从顶点 0 开始生长生成树：令 lowCost[0] = 0，totalWeight = 0。
//   4. 循环 n 次（每轮拉 1 个新顶点进入集合 U）：
//      a) 在所有 !inMST[v] 的顶点中，找出 lowCost[v] 最小的顶点 u。
//      b) 如果没找到（u == -1）或 lowCost[u] == INF，说明图不连通，立刻返回 -1！
//      c) 将 u 加入生成树：inMST[u] = true; totalWeight += lowCost[u];
//      d) 用刚加入的 u 更新其他未入树顶点 v：
//         如果 !inMST[v] && mat[u][v] < lowCost[v]，则 lowCost[v] = mat[u][v]。
//   5. 循环结束，返回 totalWeight。
//
// 【边界提醒】
//   - n == 0 时必须先返回 0，不能访问 lowCost[0]！
//   - n == 1 时只有 1 个顶点、0 条边，总权值为 0。
//   - 切记区分 Prim 与 Dijkstra：
//     Prim 的 lowCost[v] 存的是“到整个树集合的最小单条边权”（mat[u][v]），不是累计路径！
// ----------------------------------------------------------------------------
int primMST(int n, const std::vector<std::vector<int>>& mat) {
    // TODO: 实现邻接矩阵版 Prim 算法
    (void)n;
    (void)mat;
    return -1;
}

// ----------------------------------------------------------------------------
// 任务 4：Dijkstra 单源最短路径算法（非负边权）
// 【函数目标】
//   在带权图 g 中，求从源点 src 出发到所有顶点 0..g.n-1 的最短路径长度。
//   参数 g：邻接表图（保证边权 >= 0，可能存在自环、平行边或不可达顶点）。
//   参数 src：源点编号（0 .. g.n-1）。
//   返回值：长度为 g.n 的数组 dist，dist[v] 为 src 到 v 的最短距离；
//          若 v 不可达，则 dist[v] == INF；若 g.n == 0，返回空 vector。
//
// 【画图与思路推导】（经典 O(V^2) 朴素版，逻辑最直白不易写错）
//   1. 特判：若 g.n == 0，返回空 vector。
//      初始化 dist(g.n, INF)，visited(g.n, false)。
//      若 src < 0 || src >= g.n，直接返回 dist。
//   2. 源点到自己距离为 0：dist[src] = 0。
//   3. 循环 g.n 次，每轮确定一个顶点的最终最短距离：
//      a) 在所有 !visited[i] 的顶点中，找 dist[i] 最小的顶点 u。
//      b) 如果 u == -1 或 dist[u] == INF，说明剩余未访问顶点全都不可达，直接 break！
//      c) 标记 visited[u] = true（此时 dist[u] 已是最终最短路）。
//      d) 松弛操作：遍历 g.adj[u] 中的每条边 e（v = e.to, w = e.weight）：
//         如果 !visited[v] && dist[u] + w < dist[v]，
//         则更新 dist[v] = dist[u] + w。
//   4. 返回 dist。
//
// 【边界提醒】
//   - 必须在 dist[u] == INF 时 break（或松弛前检查 dist[u] < INF），避免 INF + w 溢出！
//   - 自环（u -> u）：因为 visited[u] 已经是 true，会被 !visited[v] 自动忽略，安全！
//   - 平行边（u -> v 有多条不同权值的边）：遍历 g.adj[u] 会逐条尝试松弛，自动取更小的！
// ----------------------------------------------------------------------------
std::vector<int> dijkstra(const Graph& g, int src) {
    // TODO: 实现 Dijkstra 单源最短路算法
    (void)g;
    (void)src;
    return std::vector<int>();
}

// ============================== 自动评测代码 ==============================
// 注意：请不要修改 main() 中的测试逻辑！

int main() {
    labtest::beginLab("Lab 09: 图遍历与最短路 (BFS/DFS + Prim + Dijkstra)");

    // ---------------- 1. 边界：空图与单顶点图 ----------------
    {
        Graph emptyG = makeGraph(0);
        labtest::expectEqVec(
            "空图 bfsAll",
            std::vector<int>(),
            bfsAll(emptyG),
            "当 g.n == 0 时应直接返回空 vector，不要越界访问 visited[0]");
        labtest::expectEqVec(
            "空图 dfsAll",
            std::vector<int>(),
            dfsAll(emptyG),
            "当 g.n == 0 时应直接返回空 vector");
        labtest::expectEqInt(
            "空图 primMST",
            0,
            primMST(0, std::vector<std::vector<int>>()),
            "题目约定 n == 0 时 primMST 返回 0");
        labtest::expectEqVec(
            "空图 dijkstra",
            std::vector<int>(),
            dijkstra(emptyG, 0),
            "当 g.n == 0 时 dijkstra 应直接返回空 vector");

        Graph singleG = makeGraph(1);
        std::vector<int> singleMatRow(1, 0);
        std::vector<std::vector<int>> singleMat(1, singleMatRow);
        labtest::expectEqVec(
            "单顶点图 bfsAll",
            std::vector<int>{0},
            bfsAll(singleG),
            "只有一个顶点 0 时，BFS 结果应为 [0]");
        labtest::expectEqVec(
            "单顶点图 dfsAll",
            std::vector<int>{0},
            dfsAll(singleG),
            "只有一个顶点 0 时，DFS 结果应为 [0]");
        labtest::expectEqInt(
            "单顶点图 primMST",
            0,
            primMST(1, singleMat),
            "单个顶点需要 0 条边即可构成生成树，总权值为 0");
        labtest::expectEqVec(
            "单顶点图 dijkstra",
            std::vector<int>{0},
            dijkstra(singleG, 0),
            "源点 0 到自身最短距离应为 0");
    }

    // ---------------- 2. 连通带环图的 BFS 与 DFS ----------------
    /*
     * 图结构（各邻接表严格按邻居编号升序加边）：
     *      0
     *     / \
     *    1   2
     *   / \   \
     *  3   4---5
     */
    {
        Graph g = makeGraph(6);
        addUndirectedEdge(g, 0, 1);
        addUndirectedEdge(g, 0, 2);
        addUndirectedEdge(g, 1, 3);
        addUndirectedEdge(g, 1, 4);
        addUndirectedEdge(g, 2, 5);
        addUndirectedEdge(g, 4, 5);

        labtest::expectEqVec(
            "连通带环图 bfsAll 顺序验证",
            std::vector<int>{0, 1, 2, 3, 4, 5},
            bfsAll(g),
            "检查 BFS 是否按层入队，且在【入队时】立即标记 visited，避免 5 被重复入队");

        labtest::expectEqVec(
            "连通带环图 dfsAll 顺序验证",
            std::vector<int>{0, 1, 3, 4, 5, 2},
            dfsAll(g),
            "检查 DFS 是否沿第一条未访问邻边一条路走到底：0->1->3 回溯 1->4->5->2");
    }

    // ---------------- 3. 非连通图（含孤立点 + 多个连通分量） ----------------
    // 分量 1: 0 - 2
    // 分量 2: 1（孤立点）
    // 分量 3: 3 - 4 - 6，3 - 5
    {
        Graph g = makeGraph(7);
        addUndirectedEdge(g, 0, 2);
        addUndirectedEdge(g, 3, 4);
        addUndirectedEdge(g, 3, 5);
        addUndirectedEdge(g, 4, 6);

        labtest::expectEqVec(
            "非连通图（含孤立点）bfsAll 全覆盖",
            std::vector<int>{0, 2, 1, 3, 4, 5, 6},
            bfsAll(g),
            "BFS 外层必须循环 start = 0..g.n-1，否则孤立点 1 和分量 {3,4,5,6} 会漏掉");

        labtest::expectEqVec(
            "非连通图（含孤立点）dfsAll 全覆盖",
            std::vector<int>{0, 2, 1, 3, 4, 6, 5},
            dfsAll(g),
            "DFS 外层必须循环 start = 0..g.n-1；并在分量 {3,4,5,6} 中先深搜 3->4->6 再访问 5");
    }

    // ---------------- 4. Prim 最小生成树 ----------------
    {
        // 4.1 经典 5 顶点带权无向图
        int n = 5;
        std::vector<std::vector<int>> mat(n, std::vector<int>(n, INF));
        for (int i = 0; i < n; ++i) mat[i][i] = 0;
        auto setEdge = [&](int u, int v, int w) {
            mat[u][v] = w;
            mat[v][u] = w;
        };
        setEdge(0, 1, 2);
        setEdge(0, 3, 6);
        setEdge(1, 2, 3);
        setEdge(1, 3, 8);
        setEdge(1, 4, 5);
        setEdge(2, 4, 7);
        setEdge(3, 4, 9);

        labtest::expectEqInt(
            "Prim 经典 5 顶点连通图 MST 总权值",
            16,
            primMST(n, mat),
            "MST 选边应为 (0,1)=2, (1,2)=3, (1,4)=5, (0,3)=6，总权值=16；检查 lowCost 更新逻辑");

        // 4.2 检验“后加入顶点带来更短割边”的 4 顶点图
        int n2 = 4;
        std::vector<std::vector<int>> mat2(n2, std::vector<int>(n2, INF));
        for (int i = 0; i < n2; ++i) mat2[i][i] = 0;
        auto setEdge2 = [&](int u, int v, int w) {
            mat2[u][v] = w;
            mat2[v][u] = w;
        };
        setEdge2(0, 1, 10);
        setEdge2(0, 2, 1);
        setEdge2(2, 1, 2);
        setEdge2(1, 3, 3);
        setEdge2(2, 3, 9);

        labtest::expectEqInt(
            "Prim 动态更新 lowCost（非直连最优）",
            6,
            primMST(n2, mat2),
            "选 2 后应将 lowCost[1] 从 10 更新为 2，选 1 后将 lowCost[3] 从 9 更新为 3，总权值=1+2+3=6");

        // 4.3 非连通图应返回 -1
        int n3 = 4;
        std::vector<std::vector<int>> mat3(n3, std::vector<int>(n3, INF));
        for (int i = 0; i < n3; ++i) mat3[i][i] = 0;
        mat3[0][1] = mat3[1][0] = 4;
        mat3[2][3] = mat3[3][2] = 5;

        labtest::expectEqInt(
            "Prim 非连通图返回 -1",
            -1,
            primMST(n3, mat3),
            "当某轮找不到 lowCost < INF 的未入树顶点时，图不连通，必须返回 -1");
    }

    // ---------------- 5. Dijkstra 单源最短路 ----------------
    {
        // 5.1 多路径松弛 + 不可达顶点
        Graph g = makeGraph(6);
        addDirectedEdge(g, 0, 1, 10);
        addDirectedEdge(g, 0, 2, 3);
        addDirectedEdge(g, 2, 1, 4);  // 0->2->1 = 7 < 10
        addDirectedEdge(g, 2, 3, 8);  // 0->2->3 = 11
        addDirectedEdge(g, 2, 4, 2);  // 0->2->4 = 5
        addDirectedEdge(g, 1, 3, 2);  // 0->2->1->3 = 9
        addDirectedEdge(g, 4, 3, 3);  // 0->2->4->3 = 8（最短！）
        addDirectedEdge(g, 5, 0, 1);  // 顶点 5 只有出边没有入边，从 0 不可达

        labtest::expectEqVec(
            "Dijkstra 多路径松弛与不可达顶点",
            std::vector<int>{0, 7, 3, 8, 5, INF},
            dijkstra(g, 0),
            "检查松弛公式 dist[u] + w < dist[v]，以及不可达顶点 5 应保持 INF 且不可引发溢出");

        // 5.2 自环 + 平行边 + 零权边
        Graph g2 = makeGraph(4);
        addDirectedEdge(g2, 0, 0, 5);   // 自环
        addDirectedEdge(g2, 1, 1, 0);   // 零权自环
        addDirectedEdge(g2, 0, 1, 9);   // 平行边 1
        addDirectedEdge(g2, 0, 1, 2);   // 平行边 2（更短）
        addDirectedEdge(g2, 0, 1, 6);   // 平行边 3
        addDirectedEdge(g2, 1, 2, 0);   // 零权边
        addDirectedEdge(g2, 2, 3, 4);
        addDirectedEdge(g2, 0, 3, 10);

        labtest::expectEqVec(
            "Dijkstra 自环、平行边与零权边处理",
            std::vector<int>{0, 2, 2, 6},
            dijkstra(g2, 0),
            "平行边 0->1 应自动松弛出最小权值 2，自环不应干扰结果，最终 0->1->2->3 距离为 6");
    }

    return labtest::endLab();
}
