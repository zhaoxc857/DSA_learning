// ============================================================
// 02_荷兰国旗问题.cpp
// 配套笔记：第 2 章 线性表 → 2.7 工程实践和思考 · 问题4
//
// 问题：数组里有 0、1、2 三种值（对应红、白、蓝），
//       要求原地排序成 [0...0, 1...1, 2...2]
//       要求：只遍历一次，不能开额外数组
//
// 解法：三指针法（一次遍历 O(n)，空间 O(1)）
//
// 编译运行：
//   g++ -std=c++11 02_荷兰国旗问题.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>
#include <cstdlib>
#include <ctime>
using namespace std;

// ============================================================
// 三指针法排序
// ============================================================
void sortColors(vector<int>& a) {
    int low  = 0;                  // low 左边全是 0
    int high = a.size() - 1;       // high 右边全是 2
    int i    = 0;                  // 当前处理的元素

    while (i <= high) {
        if (a[i] == 0) {
            swap(a[i], a[low]);    // 0 → 换到左边
            low++;
            i++;
        } else if (a[i] == 2) {
            swap(a[i], a[high]);   // 2 → 换到右边
            high--;
            // ★ i 不增加！换过来的数还没检查
        } else {
            i++;                   // 是 1，留在中间
        }
    }
}

// ---------- 打印 ----------
void print(const vector<int>& a) {
    for (int x : a) cout << x << " ";
    cout << endl;
}

int main() {
    cout << "========================================" << endl;
    cout << "  荷兰国旗问题（三指针一次遍历）" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 示例 1：手工模拟 -----------------
    cout << "【示例 1】[2, 0, 1]" << endl;
    vector<int> a1 = {2, 0, 1};
    cout << "  排序前: "; print(a1);
    sortColors(a1);
    cout << "  排序后: "; print(a1);
    cout << endl;

    cout << "【示例 2】[2, 0, 2, 1, 1, 0]" << endl;
    vector<int> a2 = {2, 0, 2, 1, 1, 0};
    cout << "  排序前: "; print(a2);
    sortColors(a2);
    cout << "  排序后: "; print(a2);
    cout << endl;

    // ---------- 边界情况 ----------
    cout << "【边界测试】" << endl;

    vector<int> b1 = {};                    // 空数组
    sortColors(b1);
    cout << "  空数组:       "; print(b1);

    vector<int> b2 = {1};                   // 单元素
    sortColors(b2);
    cout << "  单元素 [1]:   "; print(b2);

    vector<int> b3 = {2, 2, 2};             // 全 2
    sortColors(b3);
    cout << "  全 2:         "; print(b3);

    vector<int> b4 = {0, 0, 0};             // 全 0
    sortColors(b4);
    cout << "  全 0:         "; print(b4);

    vector<int> b5 = {2, 1, 0};             // 逆序
    sortColors(b5);
    cout << "  逆序 [2,1,0]: "; print(b5);
    cout << endl;

    // ---------- 随机大数据验证 ----------
    cout << "【正确性验证：随机 1000 个元素】" << endl;
    srand(42);
    vector<int> big;
    for (int i = 0; i < 1000; i++) big.push_back(rand() % 3);
    sortColors(big);

    // 检查是否所有 0 都在前、2 都在后
    bool ok = true;
    int cnt0 = 0, cnt1 = 0, cnt2 = 0;
    for (int x : big) {
        if (x == 0) cnt0++;
        else if (x == 1) cnt1++;
        else cnt2++;
    }
    // 验证：前 cnt0 个应该是 0，接着 cnt1 个是 1，最后 cnt2 个是 2
    for (int i = 0; i < (int)big.size(); i++) {
        int expect = (i < cnt0) ? 0 : (i < cnt0 + cnt1 ? 1 : 2);
        if (big[i] != expect) { ok = false; break; }
    }
    cout << "  0 的个数 = " << cnt0
         << ", 1 的个数 = " << cnt1
         << ", 2 的个数 = " << cnt2 << endl;
    cout << "  排序结果 " << (ok ? "正确 ✓" : "错误 ✗") << endl;
    cout << "  前 30 个: ";
    for (int i = 0; i < 30 && i < (int)big.size(); i++) cout << big[i] << " ";
    cout << "..." << endl;
    cout << endl;

    cout << "========================================" << endl;
    cout << "  算法要点：" << endl;
    cout << "  1. 一次遍历，O(n)" << endl;
    cout << "  2. 不用额外数组，空间 O(1)" << endl;
    cout << "  3. 遇到 2 时 i 不自增（换来的数还没看）" << endl;
    cout << "  4. 这是快速排序 partition 思想的变体" << endl;
    cout << "========================================" << endl;

    return 0;
}
