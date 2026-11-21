// ============================================================
// 06_散列表.cpp
// 配套笔记：第 6 章 查找 → 6.4 散列查找
//
// 内容：除留余数法 + 线性探测法 + 链地址法
//       + ASL 统计 + 性能对比
//
// 编译运行：
//   g++ -std=c++11 06_散列表.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <list>
#include <string>
#include <iomanip>
#include <algorithm>
using namespace std;

// ============================================================
// 一、线性探测法（开放定址）
// ============================================================
class LinearProbingHash {
private:
    vector<int> table;
    vector<bool> used;          // 标记位置是否被占用
    int size;
    int count;
    int probeCount;             // 统计探测次数

public:
    LinearProbingHash(int m) : size(m), count(0), probeCount(0) {
        table.assign(m, -1);
        used.assign(m, false);
    }

    int hashFunc(int key) const { return key % size; }

    // 插入
    bool insert(int key, bool verbose = false) {
        if (count >= size) {
            cout << "    表已满！" << endl;
            return false;
        }

        int h = hashFunc(key);
        int pos = h;
        int probes = 0;

        while (used[pos]) {
            probes++;
            pos = (pos + 1) % size;      // 线性探测
            if (pos == h) return false;   // 转了一圈，满了
        }

        table[pos] = key;
        used[pos] = true;
        count++;
        probeCount += probes;

        if (verbose) {
            cout << "    插入 " << setw(3) << key << ": H=" << h;
            if (probes > 0) {
                cout << " → 冲突，探测 " << probes << " 次";
            }
            cout << " → 位置 " << pos << endl;
        }
        return true;
    }

    // 查找（返回比较次数）
    int search(int key, int& compares) {
        int h = hashFunc(key);
        int pos = h;
        compares = 0;

        while (used[pos]) {
            compares++;
            if (table[pos] == key) return pos;
            pos = (pos + 1) % size;
            if (pos == h) break;
        }
        return -1;
    }

    // 打印
    void print() const {
        cout << "  散列表（表长 " << size << "）：" << endl;
        cout << "    下标: ";
        for (int i = 0; i < size; i++) cout << setw(5) << i;
        cout << endl << "    数据: ";
        for (int i = 0; i < size; i++) {
            if (used[i]) cout << setw(5) << table[i];
            else         cout << setw(5) << "-";
        }
        cout << endl;
    }

    double loadFactor() const { return (double)count / size; }

    // 计算 ASL
    double calcASL() {
        if (count == 0) return 0;
        long long total = 0;
        for (int i = 0; i < size; i++) {
            if (used[i]) {
                int c;
                search(table[i], c);
                total += c;
            }
        }
        return (double)total / count;
    }
};

// ============================================================
// 二、链地址法（拉链法）
// ============================================================
class ChainingHash {
private:
    vector<list<int>> table;
    int size;
    int count;

public:
    ChainingHash(int m) : size(m), count(0) {
        table.resize(m);
    }

    int hashFunc(int key) const { return key % size; }

    void insert(int key, bool verbose = false) {
        int h = hashFunc(key);
        table[h].push_back(key);        // 挂到链表尾部
        count++;

        if (verbose) {
            cout << "    插入 " << setw(3) << key << ": H=" << h
                 << " → 挂到链 [" << h << "]";
            if (table[h].size() > 1) cout << "（该链现在有 " << table[h].size() << " 个）";
            cout << endl;
        }
    }

    // 查找（返回比较次数）
    int search(int key, int& compares) {
        int h = hashFunc(key);
        compares = 0;

        for (int x : table[h]) {
            compares++;
            if (x == key) return h;
        }
        return -1;
    }

    void print() const {
        cout << "  散列表（表长 " << size << "，链地址法）：" << endl;
        for (int i = 0; i < size; i++) {
            cout << "    [" << setw(2) << i << "] → ";
            if (table[i].empty()) {
                cout << "∧";
            } else {
                for (int x : table[i]) cout << x << " → ";
                cout << "∧";
            }
            cout << endl;
        }
    }

    double loadFactor() const { return (double)count / size; }

    double calcASL() {
        if (count == 0) return 0;
        long long total = 0;
        for (int i = 0; i < size; i++) {
            int pos = 1;                    // 链中第 pos 个需要比较 pos 次
            for (int x : table[i]) {
                total += pos;
                pos++;
            }
        }
        return (double)total / count;
    }

    // 最长链长度
    int maxChainLen() const {
        int mx = 0;
        for (int i = 0; i < size; i++) {
            mx = max(mx, (int)table[i].size());
        }
        return mx;
    }
};

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  散列表（哈希表）" << endl;
    cout << "========================================" << endl << endl;

    // 教材例子
    vector<int> data = {18, 31, 14, 41, 27, 5};

    // ---------- 1. 线性探测法 ----------
    cout << "【1. 线性探测法】" << endl;
    cout << "  散列函数 H(key) = key % 13，表长 13" << endl;
    cout << "  插入数据: ";
    for (int x : data) cout << x << " ";
    cout << endl << endl;

    LinearProbingHash lp(13);
    for (int x : data) lp.insert(x, true);
    cout << endl;

    lp.print();
    cout << endl;
    cout << "  装载因子 = " << lp.loadFactor() << endl;
    cout << "  ASL成功 = " << lp.calcASL() << endl;
    cout << endl;

    // 查找演示
    cout << "  查找演示：" << endl;
    for (int key : {18, 31, 5, 100}) {
        int c;
        int pos = lp.search(key, c);
        cout << "    查找 " << setw(3) << key << ": ";
        if (pos >= 0) cout << "位置 " << pos;
        else          cout << "没找到";
        cout << "，比较 " << c << " 次" << endl;
    }
    cout << endl;

    // ---------- 2. 链地址法 ----------
    cout << "【2. 链地址法】" << endl;
    cout << "  同样的数据，同样的散列函数" << endl << endl;

    ChainingHash ch(13);
    for (int x : data) ch.insert(x, true);
    cout << endl;

    ch.print();
    cout << endl;
    cout << "  装载因子 = " << ch.loadFactor() << endl;
    cout << "  ASL成功 = " << ch.calcASL() << endl;
    cout << "  最长链长度 = " << ch.maxChainLen() << endl;
    cout << endl;

    cout << "  查找演示：" << endl;
    for (int key : {18, 31, 5, 100}) {
        int c;
        int pos = ch.search(key, c);
        cout << "    查找 " << setw(3) << key << ": ";
        if (pos >= 0) cout << "链 " << pos;
        else          cout << "没找到";
        cout << "，比较 " << c << " 次" << endl;
    }
    cout << endl;

    // ---------- 3. 两种方法对比 ----------
    cout << "【3. 两种冲突处理方法对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  方法          ASL成功    最长链/堆积" << endl;
    cout << "  线性探测      " << setw(6) << lp.calcASL()
         << "    位置 5,6,7 连续被占（堆积）" << endl;
    cout << "  链地址        " << setw(6) << ch.calcASL()
         << "    最长链 " << ch.maxChainLen() << " 个" << endl;
    cout << endl;

    // ---------- 4. 装载因子对性能的影响 ----------
    cout << "【4. 装载因子对性能的影响】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  表长   元素数  装载因子  线性探测ASL  链地址ASL" << endl;

    // 用 H(key) = key % 13 制造较多冲突，观察装载因子的影响
    int m = 13;
    for (int n : {5, 8, 10, 12}) {
        LinearProbingHash h1(m);
        ChainingHash h2(m);
        for (int i = 0; i < n; i++) {
            int key = i * 13 + (i % 5);   // 让很多 key 落到相近的位置
            h1.insert(key);
            h2.insert(key);
        }
        cout << "  " << setw(4) << m << "   " << setw(5) << n
             << "   " << setw(8) << setprecision(2) << h1.loadFactor()
             << "   " << setw(11) << setprecision(3) << h1.calcASL()
             << "   " << setw(9) << h2.calcASL() << endl;
    }
    cout << endl;
    cout << "  → 装载因子越大，ASL 越大（冲突越多）" << endl;
    cout << "  → 链地址法在装载因子高时表现更稳定" << endl;
    cout << endl;

    // ---------- 5. 散列 vs 其他查找 ----------
    cout << "【5. 散列查找 vs 其他查找】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  方法        时间复杂度    前提" << endl;
    cout << "  顺序查找    O(n)          无" << endl;
    cout << "  折半查找    O(log n)      有序 + 顺序存储" << endl;
    cout << "  二叉排序树  O(log n)~O(n) 动态维护" << endl;
    cout << "  散列查找    O(1)  ★       好的散列函数 + 合理装载因子" << endl;
    cout << endl;

    // ---------- 6. 演示"散列函数不好"的后果 ----------
    cout << "【6. 反例：散列函数设计不好会怎样？】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  场景：H(key) = 0（所有 key 都映射到位置 0）" << endl;

    // 用一个自定义的"坏散列函数"：全部映射到 0
    {
        vector<list<int>> badTable(10);
        vector<int> keys = {1, 2, 3, 4, 5};
        for (int x : keys) badTable[0].push_back(x);   // ★ 全部挂到链 0

        cout << "  散列表：" << endl;
        for (int i = 0; i < 10; i++) {
            cout << "    [" << setw(2) << i << "] → ";
            if (badTable[i].empty()) cout << "∧";
            else {
                for (int x : badTable[i]) cout << x << " → ";
                cout << "∧";
            }
            cout << endl;
        }

        // 计算 ASL：链 0 上的第 k 个元素需要比较 k 次
        double total = 0;
        int pos = 1;
        for (int x : badTable[0]) { total += pos; pos++; }
        double asl = total / keys.size();

        cout << "  ASL = " << asl << "（退化成顺序查找！）" << endl;
        cout << "  最长链 = " << badTable[0].size() << " 个" << endl;
    }
    cout << endl;

    cout << "  对比：好的散列函数 H(key) = key % 10" << endl;
    ChainingHash good(10);
    for (int x : {1, 2, 3, 4, 5}) good.insert(x);
    good.print();
    cout << "  ASL = " << good.calcASL() << "（几乎不冲突）" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. 散列 = 用函数直接算出存储位置" << endl;
    cout << "  2. 冲突不可避免（key 空间 >> 表长）" << endl;
    cout << "  3. 除留余数法：H(key) = key % p，p 取质数" << endl;
    cout << "  4. 线性探测会堆积，链地址法不会" << endl;
    cout << "  5. 装载因子是性能关键（0.5~0.75 为宜）" << endl;
    cout << "========================================" << endl;

    return 0;
}
