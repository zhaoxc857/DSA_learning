// ============================================================
// 05_图_邻接矩阵.cpp
// 配套笔记：第 5 章 图 → 5.2.1 邻接矩阵 / 5.3.2 图的遍历
//
// 内容：邻接矩阵存储 + DFS + BFS + 求度
//
// 编译运行：
//   g++ -std=c++11 05_图_邻接矩阵.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <queue>
#include <string>
#include <iomanip>
using namespace std;

class MGraph {
private:
    vector<char> vertex;               // 顶点表
    vector<vector<int>> edge;          // 邻接矩阵
    int numVertex, numEdge;
    bool directed;                     // 是否有向图

public:
    MGraph(int n, bool dir = false)
        : numVertex(n), numEdge(0), directed(dir) {
        vertex.resize(n);
        edge.assign(n, vector<int>(n, 0));
    }

    void setVertex(int i, char c) { vertex[i] = c; }

    // 添加边
    void addEdge(int i, int j, int w = 1) {
        edge[i][j] = w;
        if (!directed) edge[j][i] = w;    // 无向图要对称
        numEdge++;
    }

    // ---------- 打印邻接矩阵 ----------
    void printMatrix() const {
        cout << "  邻接矩阵：" << endl << "      ";
        for (int i = 0; i < numVertex; i++) cout << setw(4) << vertex[i];
        cout << endl;
        for (int i = 0; i < numVertex; i++) {
            cout << "  " << vertex[i] << " ";
            for (int j = 0; j < numVertex; j++) {
                cout << setw(4) << edge[i][j];
            }
            cout << endl;
        }
    }

    // ---------- 求度 ----------
    void printDegrees() const {
        cout << "  各顶点的度：" << endl;
        for (int i = 0; i < numVertex; i++) {
            int degree = 0;
            for (int j = 0; j < numVertex; j++) {
                if (edge[i][j] != 0) degree++;
            }
            cout << "    " << vertex[i] << " 的度 = " << degree;
            if (directed) {
                int outDeg = 0, inDeg = 0;
                for (int j = 0; j < numVertex; j++) {
                    if (edge[i][j] != 0) outDeg++;
                    if (edge[j][i] != 0) inDeg++;
                }
                cout << "（出度 " << outDeg << "，入度 " << inDeg << "）";
            }
            cout << endl;
        }
    }

    // ---------- DFS ----------
    void DFS(int v, vector<bool>& visited, string& out) {
        out += vertex[v];
        out += " ";
        visited[v] = true;                  // ★ 标记已访问

        for (int j = 0; j < numVertex; j++) {
            if (edge[v][j] != 0 && !visited[j]) {
                DFS(j, visited, out);
            }
        }
    }

    void DFSTraverse(int start, string& out) {
        vector<bool> visited(numVertex, false);
        DFS(start, visited, out);
    }

    // ---------- BFS ----------
    void BFS(int start, string& out) {
        vector<bool> visited(numVertex, false);
        queue<int> q;

        out += vertex[start];
        out += " ";
        visited[start] = true;              // ★ 入队时就标记
        q.push(start);

        while (!q.empty()) {
            int u = q.front(); q.pop();

            for (int j = 0; j < numVertex; j++) {
                if (edge[u][j] != 0 && !visited[j]) {
                    out += vertex[j];
                    out += " ";
                    visited[j] = true;      // ★ 入队时就标记（关键！）
                    q.push(j);
                }
            }
        }
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  图的邻接矩阵 + DFS/BFS" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 无向图 ----------
    cout << "【1. 无向图】" << endl;
    cout << "  图示:" << endl;
    cout << "      A ── B" << endl;
    cout << "      │    │" << endl;
    cout << "      C ── D" << endl << endl;

    MGraph g(4);
    g.setVertex(0, 'A'); g.setVertex(1, 'B');
    g.setVertex(2, 'C'); g.setVertex(3, 'D');

    g.addEdge(0, 1);   // A-B
    g.addEdge(0, 2);   // A-C
    g.addEdge(1, 3);   // B-D
    g.addEdge(2, 3);   // C-D

    g.printMatrix();
    cout << endl;
    g.printDegrees();
    cout << endl;

    string dfs, bfs;
    g.DFSTraverse(0, dfs);
    g.BFS(0, bfs);
    cout << "  从 A 出发的 DFS: " << dfs << endl;
    cout << "  从 A 出发的 BFS: " << bfs << endl;
    cout << endl;

    // ---------- 2. 带权无向图（网） ----------
    cout << "【2. 带权图（网）】" << endl;
    cout << "  图示:" << endl;
    cout << "      A ─5─ B" << endl;
    cout << "      │     │" << endl;
    cout << "      3     2" << endl;
    cout << "      │     │" << endl;
    cout << "      C ─7─ D" << endl << endl;

    MGraph wn(4);
    wn.setVertex(0, 'A'); wn.setVertex(1, 'B');
    wn.setVertex(2, 'C'); wn.setVertex(3, 'D');
    wn.addEdge(0, 1, 5);
    wn.addEdge(2, 0, 3);
    wn.addEdge(1, 3, 2);
    wn.addEdge(2, 3, 7);

    wn.printMatrix();
    cout << endl;

    // ---------- 3. 有向图 ----------
    cout << "【3. 有向图】" << endl;
    cout << "  图示:" << endl;
    cout << "      A ──→ B" << endl;
    cout << "      ↑     │" << endl;
    cout << "      │     ↓" << endl;
    cout << "      D ←── C" << endl << endl;

    MGraph dg(4, true);      // directed = true
    dg.setVertex(0, 'A'); dg.setVertex(1, 'B');
    dg.setVertex(2, 'C'); dg.setVertex(3, 'D');
    dg.addEdge(0, 1);   // A→B
    dg.addEdge(1, 2);   // B→C
    dg.addEdge(2, 3);   // C→D
    dg.addEdge(3, 0);   // D→A

    dg.printMatrix();
    cout << endl;
    dg.printDegrees();
    cout << endl;

    string ddfs, dbfs;
    dg.DFSTraverse(0, ddfs);
    dg.BFS(0, dbfs);
    cout << "  从 A 出发的 DFS: " << ddfs << endl;
    cout << "  从 A 出发的 BFS: " << dbfs << endl;
    cout << endl;

    // ---------- 4. DFS vs BFS 对比 ----------
    cout << "【4. DFS vs BFS 对比】" << endl;

    MGraph g2(6);
    for (int i = 0; i < 6; i++) g2.setVertex(i, char('A' + i));
    // 构建一个更复杂的图
    g2.addEdge(0, 1);  // A-B
    g2.addEdge(0, 2);  // A-C
    g2.addEdge(1, 3);  // B-D
    g2.addEdge(1, 4);  // B-E
    g2.addEdge(2, 5);  // C-F

    cout << "  图结构:     A" << endl;
    cout << "             / \\" << endl;
    cout << "            B   C" << endl;
    cout << "           / \\   \\" << endl;
    cout << "          D   E   F" << endl << endl;

    string s1, s2;
    g2.DFSTraverse(0, s1);
    g2.BFS(0, s2);
    cout << "  DFS（一条路走到底）: " << s1 << endl;
    cout << "  BFS（一层层扩散）:   " << s2 << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  要点：" << endl;
    cout << "  1. 邻接矩阵空间 O(n^2)，适合稠密图" << endl;
    cout << "  2. DFS 用栈（递归），BFS 用队列" << endl;
    cout << "  3. 图遍历必须标记 visited（防止绕环）" << endl;
    cout << "  4. 无向图邻接矩阵对称，有向图不一定" << endl;
    cout << "========================================" << endl;

    return 0;
}
