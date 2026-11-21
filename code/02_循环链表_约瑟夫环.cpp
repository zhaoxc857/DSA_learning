// ============================================================
// 02_循环链表_约瑟夫环.cpp
// 配套笔记：第 2 章 线性表 → 2.4 循环链表的实现
//
// 内容：循环链表 + 约瑟夫环问题（经典应用）
//
// 约瑟夫环问题：
//   n 个人围成一圈，从第 1 个人开始报数，
//   每报到 m 的人出列，然后从下一个人继续报数，
//   直到所有人出列。求出列顺序。
//
// 编译运行：
//   g++ -std=c++11 02_循环链表_约瑟夫环.cpp -o demo && ./demo
// ============================================================

#include <iostream>
using namespace std;

struct Node {
    int   data;     // 编号
    Node* next;
};

// ============================================================
// 用循环链表解约瑟夫环
// ============================================================
void josephus(int n, int m) {
    if (n <= 0) return;

    // ---------- 1. 建立循环链表（带头节点） ----------
    Node* front = new Node;         // 头节点
    front->data = 0;
    front->next = front;            // ★ 先自环（空表）

    Node* rear = front;
    for (int i = 1; i <= n; i++) {
        Node* s = new Node;
        s->data = i;
        s->next = front;            // ★ 新节点指向头节点（形成循环）
        rear->next = s;
        rear = s;
    }
    // 现在链表是: front -> 1 -> 2 -> ... -> n -> front

    cout << "初始圈（" << n << " 人）: ";
    Node* p = front->next;
    do {
        cout << p->data;
        p = p->next;
        if (p != front) cout << " -> ";    // ★ 不要走到头节点
    } while (p != front);
    cout << endl;

    // ---------- 2. 开始报数出列 ----------
    cout << "报数到 " << m << " 出列，顺序为: ";

    Node* prev = front;             // prev 是 p 的前驱
    p = front->next;                // p 从第 1 个人开始
    int remaining = n;

    while (remaining > 0) {
        // 数 m-1 步（因为 p 本身算第 1 个）
        for (int i = 1; i < m; i++) {
            prev = p;
            p = p->next;
            // 跳过"头节点"（头节点不参与报数）
            if (p == front) {
                prev = front;
                p = front->next;
            }
        }

        // 此时 p 指向要出列的人
        cout << p->data;
        remaining--;
        if (remaining > 0) cout << " -> ";

        // 删除 p
        prev->next = p->next;
        delete p;
        p = prev->next;
        if (p == front) {           // 如果跳到"头节点"，从第一个数据节点继续
            prev = front;
            p = front->next;
        }
    }
    cout << endl;

    // 释放头节点
    delete front;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  循环链表 + 约瑟夫环问题" << endl;
    cout << "========================================" << endl << endl;

    cout << "【例1】n=5, m=2" << endl;
    cout << "  说明：5 个人围成圈，报数到 2 的人出列" << endl;
    josephus(5, 2);
    cout << endl;

    cout << "【例2】n=7, m=3（经典题）" << endl;
    josephus(7, 3);
    cout << endl;

    cout << "【例3】n=10, m=4" << endl;
    josephus(10, 4);
    cout << endl;

    cout << "========================================" << endl;
    cout << "  为什么用循环链表？" << endl;
    cout << "  因为 [围成一圈] 这个关系，正好对应" << endl;
    cout << "  循环链表 [最后一个节点指回头节点] 的结构" << endl;
    cout << "  用数组模拟也可以，但循环链表最自然" << endl;
    cout << "========================================" << endl;

    return 0;
}
