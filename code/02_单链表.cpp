// ============================================================
// 02_单链表.cpp
// 配套笔记：第 2 章 线性表 → 2.3 单链表的实现
//
// 内容：完整实现带头节点的单链表，含头插/尾插/插入/删除/反转/找中间节点
//
// 编译运行：
//   g++ -std=c++11 02_单链表.cpp -o demo && ./demo
// ============================================================

#include <iostream>
using namespace std;

// ---------- 节点定义 ----------
template <class T>
struct Node {
    T     data;      // 数据域
    Node* next;      // 指针域：指向下一个节点
};

// ============================================================
// 单链表类（带头节点）
// ============================================================
template <class T>
class LinkList {
private:
    Node<T>* front;    // 头指针，指向头节点

public:
    // ---------- 构造：创建头节点 ----------
    LinkList() {
        front = new Node<T>;
        front->next = nullptr;
    }

    // ---------- 构造：用数组尾插法建立链表 ----------
    LinkList(T a[], int n) {
        front = new Node<T>;
        front->next = nullptr;
        Node<T>* rear = front;              // rear 指向最后一个节点

        for (int i = 0; i < n; i++) {
            Node<T>* s = new Node<T>;
            s->data = a[i];
            s->next = nullptr;
            rear->next = s;                 // 接到末尾
            rear = s;                       // rear 后移
        }
    }

    // ---------- 析构：释放所有节点 ----------
    ~LinkList() {
        Node<T>* p = front;
        while (p != nullptr) {
            Node<T>* q = p->next;
            delete p;
            p = q;
        }
    }

    // ---------- 求表长 O(n) ----------
    int Length() {
        Node<T>* p = front->next;
        int count = 0;
        while (p != nullptr) { count++; p = p->next; }
        return count;
    }

    // ---------- 按位查找，返回第 i 个节点（i=0 返回头节点）O(n) ----------
    Node<T>* Get(int i) {
        if (i < 0) return nullptr;
        Node<T>* p = front;
        int j = 0;
        while (p != nullptr && j < i) {
            p = p->next;
            j++;
        }
        return p;
    }

    // ---------- 按值查找，返回位序（找不到返回 0）O(n) ----------
    int Locate(T x) {
        Node<T>* p = front->next;
        int j = 1;
        while (p != nullptr) {
            if (p->data == x) return j;
            p = p->next;
            j++;
        }
        return 0;
    }

    // ---------- 插入：在第 i 个位置插入 x O(n) ----------
    void Insert(int i, T x) {
        Node<T>* p = Get(i - 1);            // 找到第 i-1 个节点
        if (p == nullptr) { cout << "[错误] 插入位置非法" << endl; return; }

        Node<T>* s = new Node<T>;
        s->data = x;
        s->next = p->next;                  // ★ 先接后
        p->next = s;                        // ★ 再断前
    }

    // ---------- 尾部插入 O(n) ----------
    void PushBack(T x) {
        Node<T>* p = front;
        while (p->next != nullptr) p = p->next;   // 走到最后一个
        Node<T>* s = new Node<T>;
        s->data = x;
        s->next = nullptr;
        p->next = s;
    }

    // ---------- 删除：删除第 i 个节点，返回其值 O(n) ----------
    T Delete(int i) {
        Node<T>* p = Get(i - 1);            // 第 i-1 个
        if (p == nullptr || p->next == nullptr) {
            cout << "[错误] 删除位置非法" << endl;
            return T();
        }
        Node<T>* q = p->next;               // 要删的
        T x = q->data;                      // 保存值
        p->next = q->next;                  // 摘掉 q
        delete q;                           // ★ 最后才 delete
        return x;
    }

    // ---------- 反转链表（头插法重建） ----------
    void Reverse() {
        Node<T>* p = front->next;    // p 指向第一个数据节点
        front->next = nullptr;       // ★ 头节点先断链

        while (p != nullptr) {
            Node<T>* q = p->next;          // ① 先记住后继
            p->next = front->next;         // ② 头插入
            front->next = p;
            p = q;                         // ③ 继续下一个
        }
    }

    // ---------- 找中间节点（快慢指针） ----------
    Node<T>* FindMiddle() {
        Node<T>* slow = front->next;
        Node<T>* fast = front->next;

        while (fast != nullptr && fast->next != nullptr) {
            slow = slow->next;             // 慢：1 步
            fast = fast->next->next;       // 快：2 步
        }
        return slow;
    }

    // ---------- 删除所有值为 x 的节点 ----------
    void RemoveAll(T x) {
        Node<T>* p = front;
        while (p->next != nullptr) {
            if (p->next->data == x) {
                Node<T>* q = p->next;
                p->next = q->next;
                delete q;
                // ★ p 不后移，因为新的 p->next 还没检查
            } else {
                p = p->next;
            }
        }
    }

    // ---------- 遍历输出 ----------
    void PrintList() const {
        cout << "链表: ";
        Node<T>* p = front->next;
        while (p != nullptr) {
            cout << p->data;
            if (p->next != nullptr) cout << " -> ";
            p = p->next;
        }
        cout << endl;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  单链表演示" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 尾插法建表 ----------
    cout << "【1. 尾插法建表（保持顺序）】" << endl;
    int a[] = {10, 20, 30, 40, 50};
    LinkList<int> L(a, 5);
    L.PrintList();                       // 10 -> 20 -> 30 -> 40 -> 50
    cout << "表长 = " << L.Length() << endl << endl;

    // ---------- 2. 按位/按值查找 ----------
    cout << "【2. 查找】" << endl;
    cout << "第 3 个元素 Get(3)->data = " << L.Get(3)->data << endl;
    cout << "元素 40 的位序 = " << L.Locate(40) << endl;
    cout << "元素 99 的位序 = " << L.Locate(99) << " (0 表示没找到)" << endl << endl;

    // ---------- 3. 插入 ----------
    cout << "【3. 在第 2 个位置插入 99】" << endl;
    cout << "插入前: "; L.PrintList();
    L.Insert(2, 99);
    cout << "插入后: "; L.PrintList();   // 10 -> 99 -> 20 -> ...
    cout << endl;

    // ---------- 4. 删除 ----------
    cout << "【4. 删除第 3 个元素】" << endl;
    cout << "删除前: "; L.PrintList();
    int del = L.Delete(3);
    cout << "被删除的值 = " << del << endl;
    cout << "删除后: "; L.PrintList();
    cout << endl;

    // ---------- 5. 反转 ----------
    cout << "【5. 反转链表】" << endl;
    cout << "反转前: "; L.PrintList();
    L.Reverse();
    cout << "反转后: "; L.PrintList();
    L.Reverse();   // 再反转回来
    cout << endl;

    // ---------- 6. 快慢指针找中间 ----------
    cout << "【6. 找中间节点（快慢指针）】" << endl;
    cout << "当前链表: "; L.PrintList();
    cout << "中间节点的值 = " << L.FindMiddle()->data << endl << endl;

    // ---------- 7. 删除所有指定值 ----------
    cout << "【7. 删除所有值为 20 的节点】" << endl;
    L.Insert(1, 20);
    L.PushBack(20);
    cout << "操作前: "; L.PrintList();
    L.RemoveAll(20);
    cout << "RemoveAll(20) 后: "; L.PrintList();
    cout << endl;

    // ---------- 8. 边界测试 ----------
    cout << "【8. 边界测试】" << endl;
    LinkList<int> empty;
    cout << "空链表长度 = " << empty.Length() << endl;
    empty.PrintList();
    cout << "对空链表删除: ";
    empty.Delete(1);
    cout << endl;

    cout << "========================================" << endl;
    cout << "  演示结束" << endl;
    cout << "========================================" << endl;

    return 0;
}
