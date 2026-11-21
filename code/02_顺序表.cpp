// ============================================================
// 02_顺序表.cpp
// 配套笔记：第 2 章 线性表 → 2.2 顺序表的实现
//
// 内容：完整实现顺序表（模板类），并用它做一个通信录
//
// 编译运行：
//   g++ -std=c++11 02_顺序表.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <string>
using namespace std;

// ============================================================
// 一、顺序表模板类
// ============================================================
template <class T>
class SeqList {
private:
    T*   data;       // 数据区（连续内存）
    int  maxSize;    // 最大容量
    int  length;     // 当前元素个数

public:
    // ---------- 构造函数 ----------
    SeqList(int size = 100) {
        maxSize = size;
        data = new T[maxSize];
        length = 0;
        cout << "[构造] 顺序表已创建，容量 = " << maxSize << endl;
    }

    // ---------- 析构函数 ----------
    ~SeqList() {
        delete[] data;     // 释放动态数组
    }

    // ---------- 求表长 O(1) ----------
    int Length() const { return length; }

    // ---------- 判空 ----------
    bool Empty() const { return length == 0; }

    // ---------- 按位查找 O(1) ----------
    T Get(int i) {
        if (i < 1 || i > length) {
            cout << "[错误] 位置 " << i << " 非法（当前表长 " << length << "）" << endl;
            return T();
        }
        return data[i - 1];          // ★ 位序 i → 下标 i-1
    }

    // ---------- 按值查找 O(n) ----------
    int Locate(T x) {
        for (int i = 0; i < length; i++) {
            if (data[i] == x) return i + 1;   // 返回位序
        }
        return 0;                             // 0 表示没找到
    }

    // ---------- 插入 O(n) ----------
    void Insert(int i, T x) {
        if (length == maxSize) { cout << "[错误] 表已满" << endl; return; }
        if (i < 1 || i > length + 1) { cout << "[错误] 插入位置非法" << endl; return; }

        // ★ 从后往前搬，否则会覆盖数据
        for (int j = length; j >= i; j--) {
            data[j] = data[j - 1];
        }
        data[i - 1] = x;
        length++;
    }

    // ---------- 尾部插入 O(1) ----------
    void PushBack(T x) {
        Insert(length + 1, x);
    }

    // ---------- 删除 O(n) ----------
    T Delete(int i) {
        if (i < 1 || i > length) { cout << "[错误] 删除位置非法" << endl; return T(); }

        T x = data[i - 1];              // 保存要返回的值

        // ★ 从前往后搬
        for (int j = i - 1; j < length - 1; j++) {
            data[j] = data[j + 1];
        }
        length--;
        return x;
    }

    // ---------- 遍历输出 ----------
    void PrintList() const {
        cout << "顺序表 (" << length << "/" << maxSize << "): [";
        for (int i = 0; i < length; i++) {
            cout << data[i];
            if (i < length - 1) cout << ", ";
        }
        cout << "]" << endl;
    }

    // ---------- 删除所有值为 x 的元素 O(n) ----------
    void RemoveAll(T x) {
        int k = 0;                        // k 记录"保留下来"的元素个数
        for (int i = 0; i < length; i++) {
            if (data[i] != x) {
                data[k++] = data[i];      // 保留下来的往前放
            }
        }
        length = k;
    }
};

// ============================================================
// 二、用顺序表实现通信录
// ============================================================
struct Contact {
    string name;
    string phone;

    // 重载 == 运算符，让 Locate 能用
    bool operator==(const Contact& o) const { return name == o.name; }
};

ostream& operator<<(ostream& os, const Contact& c) {
    return os << c.name << "(" << c.phone << ")";
}

// ============================================================
// 三、演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  顺序表演示" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 基本操作 ----------
    cout << "【1. 基本操作】" << endl;
    SeqList<int> L(10);

    for (int i = 1; i <= 5; i++) L.PushBack(i * 10);
    L.PrintList();                     // [10, 20, 30, 40, 50]

    cout << "表长 = " << L.Length() << endl;
    cout << "第 3 个元素 Get(3) = " << L.Get(3) << endl;   // 30
    cout << "元素 40 的位置 = " << L.Locate(40) << endl;    // 4
    cout << "元素 99 的位置 = " << L.Locate(99) << " (0 表示没找到)" << endl;
    cout << endl;

    // ---------- 2. 插入 ----------
    cout << "【2. 插入演示：在第 2 个位置插入 99】" << endl;
    cout << "插入前: "; L.PrintList();
    L.Insert(2, 99);
    cout << "插入后: "; L.PrintList();   // [10, 99, 20, 30, 40, 50]
    cout << endl;

    // ---------- 3. 删除 ----------
    cout << "【3. 删除演示：删除第 3 个元素】" << endl;
    cout << "删除前: "; L.PrintList();
    int removed = L.Delete(3);
    cout << "被删除的值 = " << removed << endl;
    cout << "删除后: "; L.PrintList();
    cout << endl;

    // ---------- 4. 删除所有指定值 ----------
    cout << "【4. 删除所有值为 99 的元素】" << endl;
    L.Insert(1, 99);
    L.Insert(4, 99);
    cout << "插入两个 99 后: "; L.PrintList();
    L.RemoveAll(99);
    cout << "RemoveAll(99) 后: "; L.PrintList();
    cout << endl;

    // ---------- 5. 边界测试 ----------
    cout << "【5. 边界测试】" << endl;
    cout << "访问第 100 个元素（越界）: ";
    L.Get(100);
    cout << "在第 0 个位置插入（非法）: ";
    L.Insert(0, 5);
    cout << endl;

    // ---------- 6. 通信录应用 ----------
    cout << "【6. 通信录应用】" << endl;
    SeqList<Contact> pb(50);
    pb.PushBack({"张三", "138-0000-1111"});
    pb.PushBack({"李四", "139-0000-2222"});
    pb.PushBack({"王五", "137-0000-3333"});

    cout << "通信录内容:" << endl;
    for (int i = 1; i <= pb.Length(); i++) {
        Contact c = pb.Get(i);
        cout << "  " << i << ". " << c << endl;
    }

    // 按姓名查找
    Contact target{"李四", ""};
    int pos = pb.Locate(target);
    cout << "查找\"李四\"→ 第 " << pos << " 位" << endl;

    // 删除
    pb.Delete(pos);
    cout << "删除后，表长 = " << pb.Length() << endl;
    for (int i = 1; i <= pb.Length(); i++) {
        cout << "  " << i << ". " << pb.Get(i) << endl;
    }

    cout << endl << "========================================" << endl;
    cout << "  演示结束" << endl;
    cout << "========================================" << endl;

    return 0;
}
