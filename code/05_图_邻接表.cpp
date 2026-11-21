// ============================================================
// 05_图_邻接表.cpp
// 配套笔记：第 5 章 图 → 5.2.2 邻接表 / 5.3 图的实现
//
// 内容：邻接表存储 + DFS + BFS + 拓扑排序 + 连通分量
//
// 编译运行：
//   g++ -std=c++11 05_图_邻接表.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <queue>
#include <stack>
#include <string>
using namespace std;

// ---------- 边节点 ----------
struct EdgeNode {
    int adjvex;         // 邻接顶点编号
    int weight;         // 权值
    EdgeNode* next;

    EdgeNode(int v, int w = 1) : adjvex(v), weight(w), next(nullptr) {}
};

class ALGraph {
private:
    vector<char> vertex;            // 顶点表
    vector<EdgeNode*> adjList;      // 邻接表
    int numVertex, numEdge;
    bool directed;

public:
    ALGraph(int n, bool dir = false)
        : numVertex(n), numEdge(0), directed(dir) {
        vertex.resize(n);
        adjList.assign(n, nullptr);
    }

    ~ALGraph() {
        // ★ 析构：释放所有边节点
        for (int i = 0; i < numVertex; i++) {
            EdgeNode* p = adjList[i];
            while (p) {
                EdgeNode* q = p->next;
                delete p;
                p = q;
            }
        }
    }

    void setVertex(int i, char c) { vertex[i] = c; }

    // 头插法添加边
    void addEdge(int i, int j, int w = 1) {
        EdgeNode* node = new EdgeNode(j, w);
        node->next = adjList[i];
        adjList[i] = node;
        numEdge++;
    }

    void addUndirectedEdge(int i, int j, int w = 1) {
        addEdge(i, j, w);
        addEdge(j, i, w);
    }

    // ---------- 打印邻接表 ----------
    void print() const {
        cout << "  邻接表：" << endl;
        for (int i = 0; i < numVertex; i++) {
            cout << "    " << vertex[i] << " → ";
            for (EdgeNode* p = adjList[i]; p; p = p->next) {
                cout << vertex[p->adjvex];
                if (p->weight != 1) cout << "(" << p->weight << ")";
                cout << " → ";
            }
            cout << "∧" << endl;
        }
    }

    // ---------- 求度 ----------
    void printDegrees() const {
        cout << "  各顶点的度：" << endl;
        for (int i = 0; i < numVertex; i++) {
            int outDeg = 0;
            for (EdgeNode* p = adjList[i]; p; p = p->next) outDeg++;

            if (!directed) {
                cout << "    " << vertex[i] << " 的度 = " << outDeg << endl;
            } else {
                int inDeg = 0;
                for (int j = 0; j < numVertex; j++) {
                    for (EdgeNode* p = adjList[j]; p; p = p->next) {
                        if (p->adjvex == i) inDeg++;
                    }
                }
                cout << "    " << vertex[i] << " 的出度 = " << outDeg
                     << "，入度 = " << inDeg
                     << "，度 = " << outDeg + inDeg << endl;
            }
        }
    }

    // ---------- DFS（递归） ----------
    void DFS(int v, vector<bool>& visited, string& out) {
        out += vertex[v];
        out += " ";
        visited[v] = true;

        for (EdgeNode* p = adjList[v]; p; p = p->next) {
            if (!visited[p->adjvex]) {
                DFS(p->adjvex, visited, out);
            }
        }
    }

    // ---------- DFS（非递归，用显式栈） ----------
    void DFSIterative(int start, string& out) {
        vector<bool> visited(numVertex, false);
        stack<int> st;
        st.push(start);

        while (!st.empty()) {
            int u = st.top(); st.pop();
            if (visited[u]) continue;      // 可能被重复压入

            out += vertex[u];
            out += " ";
            visited[u] = true;

            // 逆序压栈（保证按邻接表顺序访问）
            vector<int> neighbors;
            for (EdgeNode* p = adjList[u]; p; p = p->next) {
                if (!visited[p->adjvex]) neighbors.push_back(p->adjvex);
            }
            for (int i = neighbors.size() - 1; i >= 0; i--) {
                st.push(neighbors[i]);
            }
        }
    }

    // ---------- BFS ----------
    void BFS(int start, string& out) {
        vector<bool> visited(numVertex, false);
        queue<int> q;

        out += vertex[start];
        out += " ";
        visited[start] = true;              // ★ 入队时标记
        q.push(start);

        while (!q.empty()) {
            int u = q.front(); q.pop();

            for (EdgeNode* p = adjList[u]; p; p = p->next) {
                int w = p->adjvex;
                if (!visited[w]) {
                    out += vertex[w];
                    out += " ";
                    visited[w] = true;      // ★ 关键
                    q.push(w);
                }
            }
        }
    }

    // ---------- 拓扑排序（有向无环图） ----------
    vector<int> topologicalSort() {
        vector<int> inDegree(numVertex, 0);

        // 统计入度
        for (int i = 0; i < numVertex; i++) {
            for (EdgeNode* p = adjList[i]; p; p = p->next) {
                inDegree[p->adjvex]++;
            }
        }

        // 入度为 0 的入队
        queue<int> q;
        for (int i = 0; i < numVertex; i++) {
            if (inDegree[i] == 0) q.push(i);
        }

        vector<int> result;
        while (!q.empty()) {
            int u = q.front(); q.pop();
            result.push_back(u);

            for (EdgeNode* p = adjList[u]; p; p = p->next) {
                if (--inDegree[p->adjvex] == 0) {
                    q.push(p->adjvex);
                }
            }
        }
        return result;    // 长度 < n 说明有环
    }

    // ---------- 求连通分量个数（无向图） ----------
    int countComponents() {
        vector<bool> visited(numVertex, false);
        int count = 0;

        for (int i = 0; i < numVertex; i++) {
            if (!visited[i]) {
                count++;
                string tmp;
                DFS(i, visited, tmp);      // 一次 DFS 覆盖一个连通分量
            }
        }
        return count;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  图的邻接表 + DFS/BFS/拓扑排序" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 无向图 ----------
    cout << "【1. 无向图】" << endl;
    cout << "  图示:" << endl;
    cout << "      A ── B" << endl;
    cout << "      │    │" << endl;
    cout << "      C ── D" << endl << endl;

    ALGraph g(4);
    g.setVertex(0, 'A'); g.setVertex(1, 'B');
    g.setVertex(2, 'C'); g.setVertex(3, 'D');

    // 为了让邻居按 A,B,C,D 顺序，逆序添加
    g.addUndirectedEdge(2, 3);   // C-D
    g.addUndirectedEdge(1, 3);   // B-D
    g.addUndirectedEdge(0, 2);   // A-C
    g.addUndirectedEdge(0, 1);   // A-B

    g.print();
    cout << endl;
    g.printDegrees();
    cout << endl;

    string dfs, bfs, dfsIter;
    vector<bool> vis(4, false);
    g.DFS(0, vis, dfs);
    g.BFS(0, bfs);
    g.DFSIterative(0, dfsIter);

    cout << "  DFS（递归）:   " << dfs << endl;
    cout << "  DFS（非递归）: " << dfsIter << endl;
    cout << "  BFS:           " << bfs << endl;
    cout << endl;

    // ---------- 2. 复杂一点的图 ----------
    cout << "【2. 六顶点图】" << endl;
    cout << "        A" << endl;
    cout << "       / \\" << endl;
    cout << "      B   C" << endl;
    cout << "     / \\   \\" << endl;
    cout << "    D   E   F" << endl << endl;

    ALGraph g2(6);
    for (int i = 0; i < 6; i++) g2.setVertex(i, char('A' + i));
    g2.addUndirectedEdge(1, 4);  // B-E
    g2.addUndirectedEdge(1, 3);  // B-D
    g2.addUndirectedEdge(0, 1);  // A-B
    g2.addUndirectedEdge(2, 5);  // C-F
    g2.addUndirectedEdge(0, 2);  // A-C

    g2.print();
    cout << endl;

    string s1, s2, s3;
    vector<bool> v2(6, false);
    g2.DFS(0, v2, s1);
    g2.BFS(0, s2);
    g2.DFSIterative(0, s3);

    cout << "  DFS（递归）:   " << s1 << endl;
    cout << "  DFS（非递归）: " << s3 << endl;
    cout << "  BFS:           " << s2 << endl;
    cout << endl;

    // ---------- 3. 有向无环图 + 拓扑排序 ----------
    cout << "【3. 有向无环图（课程先修关系）】" << endl;
    cout << "  0:程序设计  1:数据结构  2:算法  3:操作系统  4:编译原理" << endl << endl;
    cout << "  依赖关系:" << endl;
    cout << "    程序设计 → 数据结构" << endl;
    cout << "    数据结构 → 算法" << endl;
    cout << "    数据结构 → 操作系统" << endl;
    cout << "    算法 → 编译原理" << endl;
    cout << "    操作系统 → 编译原理" << endl << endl;

    ALGraph dag(5, true);
    const char* names[] = {"程序设计", "数据结构", "算法", "操作系统", "编译原理"};
    for (int i = 0; i < 5; i++) dag.setVertex(i, char('0' + i));

    dag.addEdge(0, 1);   // 程序设计 → 数据结构
    dag.addEdge(1, 2);   // 数据结构 → 算法
    dag.addEdge(1, 3);   // 数据结构 → 操作系统
    dag.addEdge(2, 4);   // 算法 → 编译原理
    dag.addEdge(3, 4);   // 操作系统 → 编译原理

    dag.print();
    cout << endl;

    vector<int> order = dag.topologicalSort();
    cout << "  拓扑排序结果（一种合法的学习顺序）:" << endl << "    ";
    for (size_t i = 0; i < order.size(); i++) {
        cout << names[order[i]];
        if (i + 1 < order.size()) cout << " → ";
    }
    cout << endl;
    cout << "  （共 " << order.size() << " 个顶点，"
         << (order.size() == 5 ? "无环 ✓" : "有环 ✗") << "）" << endl << endl;

    // ---------- 4. 连通分量 ----------
    cout << "【4. 连通分量】" << endl;
    cout << "  图: A-B-C 和 D-E 两块（不连通）" << endl << endl;

    ALGraph g3(5);
    for (int i = 0; i < 5; i++) g3.setVertex(i, char('A' + i));
    g3.addUndirectedEdge(0, 1);   // A-B
    g3.addUndirectedEdge(1, 2);   // B-C
    g3.addUndirectedEdge(3, 4);   // D-E

    g3.print();
    cout << "  连通分量个数 = " << g3.countComponents() << endl << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 邻接表空间 O(n+e)，适合稀疏图" << endl;
    cout << "  2. 顶点 i 的链表长度 = 出度" << endl;
    cout << "  3. 拓扑排序：反复取入度为 0 的顶点" << endl;
    cout << "  4. 拓扑排序结果长度 < n 说明有环" << endl;
    cout << "========================================" << endl;

    return 0;
}
