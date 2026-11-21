// ============================================================
// 02_双链表.cpp
// 配套笔记：第 2 章 线性表 → 2.5 双链表的实现
//
// 内容：双向链表的插入与删除（对比单链表多一个 prior 指针）
//
// 编译运行：
//   g++ -std=c++11 02_双链表.cpp -o demo && ./demo
// ============================================================

#include <iostream>
using namespace std;

// ---------- 双链表节点 ----------
template <class T>
struct DNode {
    T      data;
    DNode* prior;    // ★ 指向前驱
    DNode* next;     // 指向后继
};

// ============================================================
// 双链表类（带头节点）
// ============================================================
template <class T>
class DLinkList {
private:
    DNode<T>* front;    // 头指针

public:
    DLinkList() {
        front = new DNode<T>;
        front->prior = nullptr;
        front->next  = nullptr;
    }

    ~DLinkList() {
        DNode<T>* p = front;
        while (p != nullptr) {
            DNode<T>* q = p->next;
            delete p;
            p = q;
        }
    }

    // ---------- 尾部插入（保留 rear 避免每次都遍历） ----------
    void PushBack(T x) {
        DNode<T>* p = front;
        while (p->next != nullptr) p = p->next;   // 走到最后一个

        DNode<T>* s = new DNode<T>;
        s->data = x;
        s->next = nullptr;
        s->prior = p;           // ① s 的前驱 = p
        p->next = s;            // ② p 的后继 = s
    }

    // ---------- 在 p 节点之后插入 s（核心操作，4 个指针） ----------
    void InsertAfter(DNode<T>* p, T x) {
        if (p == nullptr) return;

        DNode<T>* s = new DNode<T>;
        s->data = x;

        s->next = p->next;                        // ① s 接住 p 的后继
        if (p->next != nullptr) {
            p->next->prior = s;                   // ② 原后继的前驱改指向 s
        }
        s->prior = p;                             // ③ s 的前驱 = p
        p->next = s;                              // ④ p 的后继 = s
    }

    // ---------- 删除节点 p（核心操作） ----------
    void DeleteNode(DNode<T>* p) {
        if (p == nullptr || p == front) return;   // 不能删头节点

        if (p->prior != nullptr) p->prior->next = p->next;   // ① 前驱跳过 p
        if (p->next != nullptr)  p->next->prior = p->prior;  // ② 后继跳过 p
        delete p;                                            // ③ 释放
    }

    // ---------- 按位查找 ----------
    DNode<T>* Get(int i) {
        DNode<T>* p = front;
        int j = 0;
        while (p != nullptr && j < i) { p = p->next; j++; }
        return p;
    }

    // ---------- 正向遍历 ----------
    void PrintForward() const {
        cout << "正向: ";
        DNode<T>* p = front->next;
        while (p != nullptr) {
            cout << p->data;
            if (p->next != nullptr) cout << " <-> ";
            p = p->next;
        }
        cout << endl;
    }

    // ---------- 反向遍历（双链表独有！） ----------
    void PrintBackward() const {
        cout << "反向: ";
        // 先走到最后一个节点
        DNode<T>* p = front;
        while (p->next != nullptr) p = p->next;

        // 再靠 prior 往回走
        while (p != front) {
            cout << p->data;
            if (p->prior != front) cout << " <-> ";
            p = p->prior;
        }
        cout << endl;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  双链表演示" << endl;
    cout << "========================================" << endl << endl;

    DLinkList<int> L;
    for (int i = 1; i <= 5; i++) L.PushBack(i * 10);

    cout << "【1. 初始链表】" << endl;
    L.PrintForward();      // 10 <-> 20 <-> 30 <-> 40 <-> 50
    L.PrintBackward();     // 50 <-> 40 <-> 30 <-> 20 <-> 10  ← 单链表做不到！
    cout << endl;

    cout << "【2. 在第 2 个节点后插入 99】" << endl;
    DNode<int>* p2 = L.Get(2);       // 第 2 个节点（值 20）
    cout << "  定位到节点: " << p2->data << endl;
    L.InsertAfter(p2, 99);
    L.PrintForward();      // 10 <-> 20 <-> 99 <-> 30 <-> 40 <-> 50
    L.PrintBackward();     // 反向验证 prior 指针是否正确
    cout << endl;

    cout << "【3. 删除值为 99 的节点】" << endl;
    DNode<int>* p3 = L.Get(3);       // 值 99
    cout << "  要删除的节点: " << p3->data << endl;
    L.DeleteNode(p3);
    L.PrintForward();      // 10 <-> 20 <-> 30 <-> 40 <-> 50
    L.PrintBackward();
    cout << endl;

    cout << "【4. 删除最后一个节点（边界）】" << endl;
    DNode<int>* last = L.Get(5);     // 值 50
    cout << "  要删除的节点: " << last->data << endl;
    L.DeleteNode(last);
    L.PrintForward();      // 10 <-> 20 <-> 30 <-> 40
    L.PrintBackward();
    cout << endl;

    cout << "========================================" << endl;
    cout << "  双链表的核心优势：" << endl;
    cout << "  PrintBackward() 能反向遍历，单链表做不到" << endl;
    cout << "  因为每个节点都存了 prior 指针" << endl;
    cout << "========================================" << endl;

    return 0;
}
