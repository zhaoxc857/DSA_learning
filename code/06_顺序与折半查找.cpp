// ============================================================
// 06_顺序与折半查找.cpp
// 配套笔记：第 6 章 查找 → 6.2 线性表查找
//
// 内容：顺序查找（含哨兵优化）+ 折半查找（循环/递归）
//       + ASL 计算 + 判定树
//
// 编译运行：
//   g++ -std=c++11 06_顺序与折半查找.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <algorithm>
#include <iomanip>
using namespace std;

// ============================================================
// 一、顺序查找
// ============================================================

// 普通版
int seqSearch(const vector<int>& a, int key, int& compareCount) {
    compareCount = 0;
    for (size_t i = 0; i < a.size(); i++) {
        compareCount++;
        if (a[i] == key) return i;
    }
    return -1;
}

// 哨兵版（减少一次比较）
int seqSearchSentinel(vector<int>& a, int key, int& compareCount) {
    compareCount = 0;
    int n = a.size();

    // a[0] 作为哨兵（原本 a[0] 的数据先保存）
    int backup = a[0];
    a[0] = key;

    int i = n - 1;
    while (a[i] != key) {
        compareCount++;
        i--;
    }
    if (a[i] == key) compareCount++;

    // 恢复并检查是不是真的找到了
    if (i == 0 && backup != key) {
        a[0] = backup;
        return -1;      // 只有哨兵匹配，说明没找到
    }
    a[0] = backup;
    return i;
}

// ============================================================
// 二、折半查找
// ============================================================

// 循环版
int binarySearch(const vector<int>& a, int key, int& compareCount,
                 bool verbose = false) {
    compareCount = 0;
    int low = 0, high = a.size() - 1;

    while (low <= high) {
        int mid = low + (high - low) / 2;   // ★ 防溢出写法
        compareCount++;

        if (verbose) {
            cout << "      low=" << low << " high=" << high
                 << " mid=" << mid << " a[mid]=" << a[mid];
        }

        if (a[mid] == key) {
            if (verbose) cout << "  → 找到！" << endl;
            return mid;
        } else if (a[mid] > key) {
            if (verbose) cout << "  → 往左" << endl;
            high = mid - 1;
        } else {
            if (verbose) cout << "  → 往右" << endl;
            low = mid + 1;
        }
    }
    return -1;
}

// 递归版
int binarySearchRec(const vector<int>& a, int low, int high, int key,
                    int& compareCount) {
    if (low > high) return -1;

    int mid = low + (high - low) / 2;
    compareCount++;

    if (a[mid] == key)     return mid;
    else if (a[mid] > key) return binarySearchRec(a, low, mid - 1, key, compareCount);
    else                   return binarySearchRec(a, mid + 1, high, key, compareCount);
}

// ============================================================
// 三、计算 ASL
// ============================================================

// 顺序查找的 ASL（等概率）
double seqASL(int n) {
    return (n + 1) / 2.0;
}

// 折半查找的 ASL（通过模拟所有元素查找）
double binaryASL(const vector<int>& a) {
    int n = a.size();
    long long totalCompares = 0;

    for (int i = 0; i < n; i++) {
        int cnt = 0;
        binarySearch(a, a[i], cnt);
        totalCompares += cnt;
    }
    return (double)totalCompares / n;
}

// ============================================================
// 四、构建判定树（打印每层的节点数）
// ============================================================
void printDecisionTree(const vector<int>& a) {
    int n = a.size();
    // 用 BFS 模拟折半过程，统计每层的节点数
    vector<int> levelCounts;
    vector<pair<int,int>> ranges = {{0, n - 1}};
    vector<int> levels = {1};

    while (!ranges.empty()) {
        vector<pair<int,int>> nextRanges;
        vector<int> nextLevels;
        int count = 0;

        for (size_t i = 0; i < ranges.size(); i++) {
            int low = ranges[i].first, high = ranges[i].second;
            if (low > high) continue;

            int mid = low + (high - low) / 2;
            count++;

            if (low <= mid - 1) {
                nextRanges.push_back({low, mid - 1});
                nextLevels.push_back(levels[i] + 1);
            }
            if (mid + 1 <= high) {
                nextRanges.push_back({mid + 1, high});
                nextLevels.push_back(levels[i] + 1);
            }
        }

        if (count == 0) break;
        levelCounts.push_back(count);
        ranges = nextRanges;
        levels = nextLevels;
    }

    cout << "  判定树的各层节点数：" << endl;
    int total = 0;
    long long weightedSum = 0;
    for (size_t i = 0; i < levelCounts.size(); i++) {
        cout << "    第 " << i + 1 << " 层: " << levelCounts[i] << " 个节点"
             << "（比较 " << i + 1 << " 次）" << endl;
        total += levelCounts[i];
        weightedSum += (long long)levelCounts[i] * (i + 1);
    }
    cout << "  节点总数 = " << total << "（应等于 n = " << n << "）" << endl;
    cout << "  树的高度 = " << levelCounts.size() << " 层" << endl;
    cout << "  ASL = " << weightedSum << " / " << total
         << " = " << setprecision(4) << (double)weightedSum / total << endl;
}

// ============================================================
// 演示
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  顺序查找 vs 折半查找" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 1. 顺序查找 ----------
    cout << "【1. 顺序查找】" << endl;
    cout << "----------------------------------------" << endl;

    vector<int> a = {5, 13, 19, 21, 37, 56, 64, 75, 80, 88, 92};

    cout << "  数组: ";
    for (int x : a) cout << x << " ";
    cout << endl << endl;

    for (int key : {21, 92, 100}) {
        int cnt = 0;
        int pos = seqSearch(a, key, cnt);
        cout << "  查找 " << setw(3) << key << ": ";
        if (pos >= 0) cout << "找到，下标 " << pos;
        else          cout << "没找到";
        cout << "，比较 " << cnt << " 次" << endl;
    }
    cout << endl;

    // ---------- 2. 比较次数统计（顺序查找） ----------
    cout << "【2. 顺序查找的比较次数分布】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  查找目标   比较次数" << endl;
    int total = 0;
    for (size_t i = 0; i < a.size(); i++) {
        cout << "    " << setw(3) << a[i] << "        " << i + 1 << endl;
        total += i + 1;
    }
    cout << "  ASL成功 = (" ;
    for (size_t i = 0; i < a.size(); i++) {
        cout << i + 1;
        if (i + 1 < a.size()) cout << "+";
    }
    cout << ") / " << a.size() << " = " << (double)total / a.size() << endl;
    cout << "  公式 (n+1)/2 = (" << a.size() << "+1)/2 = " << seqASL(a.size()) << endl;
    cout << endl;

    // ---------- 3. 折半查找 ----------
    cout << "【3. 折半查找（详细过程）】" << endl;
    cout << "----------------------------------------" << endl;

    int key = 21;
    cout << "  查找 " << key << "：" << endl;
    int cnt = 0;
    int pos = binarySearch(a, key, cnt, true);
    cout << "  → 找到位置 " << pos << "，共比较 " << cnt << " 次" << endl << endl;

    key = 92;
    cout << "  查找 " << key << "：" << endl;
    binarySearch(a, key, cnt, true);
    cout << "  → 共比较 " << cnt << " 次" << endl << endl;

    key = 100;
    cout << "  查找 " << key << "（不存在）：" << endl;
    binarySearch(a, key, cnt, true);
    cout << "  → 没找到，共比较 " << cnt << " 次" << endl << endl;

    // ---------- 4. 递归版验证 ----------
    cout << "【4. 递归版折半查找】" << endl;
    cout << "----------------------------------------" << endl;
    for (int k : {5, 21, 56, 92, 100}) {
        int c1 = 0, c2 = 0;
        int p1 = binarySearch(a, k, c1);
        int p2 = binarySearchRec(a, 0, a.size() - 1, k, c2);
        cout << "  查找 " << setw(3) << k << ": 循环版=" << p1
             << "（" << c1 << "次）, 递归版=" << p2 << "（" << c2 << "次）"
             << (p1 == p2 ? " ✓" : " ✗") << endl;
    }
    cout << endl;

    // ---------- 5. ASL 对比 ----------
    cout << "【5. ASL 对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  n = " << a.size() << endl;
    cout << "  顺序查找 ASL = " << seqASL(a.size()) << endl;
    cout << "  折半查找 ASL = " << setprecision(4) << binaryASL(a) << endl;
    cout << endl;

    printDecisionTree(a);
    cout << endl;

    // ---------- 6. 不同数据规模的对比 ----------
    cout << "【6. 不同规模下的 ASL 对比】" << endl;
    cout << "----------------------------------------" << endl;
    cout << "      n    顺序查找ASL    折半查找ASL    倍数" << endl;

    for (int n : {10, 100, 1000, 10000, 100000}) {
        vector<int> big(n);
        for (int i = 0; i < n; i++) big[i] = i;

        double seq = seqASL(n);
        double bin = binaryASL(big);

        cout << "  " << setw(6) << n << "    " << setw(10) << seq
             << "    " << setw(10) << setprecision(4) << bin
             << "    " << setw(6) << (int)(seq / bin) << "x" << endl;
    }
    cout << endl;
    cout << "  → 数据量越大，折半查找的优势越明显！" << endl;
    cout << "     n=10万时，顺序查找要 5 万次，折半只要 17 次左右" << endl;
    cout << endl;

    // ---------- 7. 前提条件演示 ----------
    cout << "【7. 折半查找的前提：必须有序】" << endl;
    cout << "----------------------------------------" << endl;
    vector<int> unsorted = {5, 13, 19, 21, 37, 56, 64, 75, 80, 88, 92};
    cout << "  有序数组查找 21: ";
    int c = 0;
    cout << "位置 " << binarySearch(unsorted, 21, c) << "（" << c << " 次）" << endl;

    // 打乱
    vector<int> shuffled = unsorted;
    for (int i = shuffled.size() - 1; i > 0; i--) {
        swap(shuffled[i], shuffled[rand() % (i + 1)]);
    }
    cout << "  打乱后查找 21: ";
    c = 0;
    int r = binarySearch(shuffled, 21, c);
    cout << (r >= 0 ? "位置 " + to_string(r) : string("没找到"))
         << "（" << c << " 次）" << endl;
    cout << "  → 注意：打乱后折半查找的结果是【未定义】的（可能找不到）" << endl;
    cout << "     因为折半查找要求数组必须有序！" << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. 顺序查找 O(n)，ASL=(n+1)/2，对数据无要求" << endl;
    cout << "  2. 折半查找 O(log n)，但要求【有序 + 顺序存储】" << endl;
    cout << "  3. 折半代码三要点：while(low<=high)、mid防溢出、mid±1" << endl;
    cout << "  4. 折半的判定树高度 = log2(n) + 1" << endl;
    cout << "========================================" << endl;

    return 0;
}
