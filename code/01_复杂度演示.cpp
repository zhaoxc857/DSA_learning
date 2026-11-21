// ============================================================
// 01_复杂度演示.cpp
// 配套笔记：第 1 章 绪论 → 1.3.2 算法分析
//
// 目的：用真实计时器"看见"不同时间复杂度的差距
//
// 编译运行：
//   g++ 01_复杂度演示.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <chrono>
using namespace std;
using namespace std::chrono;

// ---------- 工具函数：测量一个函数的运行耗时（毫秒） ----------
template <typename Func>
double measureMs(Func f) {
    auto start = high_resolution_clock::now();
    f();                                              // 执行被测量的代码
    auto end = high_resolution_clock::now();
    return duration_cast<duration<double, milli>>(end - start).count();
}

// ---------- O(1)：常数阶 ----------
long long sumO1(long long n) {
    return n * (n + 1) / 2;      // 直接用求和公式，跟 n 无关
}

// ---------- O(n)：线性阶 ----------
long long sumOn(long long n) {
    long long s = 0;
    for (long long i = 1; i <= n; i++) s += i;
    return s;
}

// ---------- O(n^2)：平方阶 ----------
long long sumOn2(long long n) {
    long long s = 0;
    for (long long i = 1; i <= n; i++)
        for (long long j = 1; j <= i; j++)
            s++;
    return s;
}

// ---------- O(log n)：对数阶（统计需要翻倍几次） ----------
int countLog(long long n) {
    int cnt = 0;
    for (long long i = 1; i < n; i *= 2) cnt++;
    return cnt;
}

int main() {
    cout << "========================================" << endl;
    cout << "  时间复杂度实测演示" << endl;
    cout << "========================================" << endl << endl;

    // ---------- 演示 1：O(1) vs O(n) 求 1..n 的和 ----------
    cout << "【演示1】求 1 到 n 的和：公式法 O(1) vs 循环法 O(n)" << endl;
    cout << "----------------------------------------" << endl;
    long long n = 100000000LL;   // 1 亿

    double t1 = measureMs([&]{ sumO1(n); });
    cout << "  公式法 (O(1))   n=1亿  耗时: " << t1 << " 毫秒" << endl;

    double t2 = measureMs([&]{ sumOn(n); });
    cout << "  循环法 (O(n))   n=1亿  耗时: " << t2 << " 毫秒" << endl;
    cout << "  → 结果相同: " << sumO1(n) << " == " << sumOn(n) << endl;
    cout << "  → 差距约 " << (t2 / (t1 > 0 ? t1 : 0.001)) << " 倍！" << endl << endl;

    // ---------- 演示 2：O(n) vs O(n^2) ----------
    cout << "【演示2】O(n) 与 O(n^2) 随规模增长的变化" << endl;
    cout << "----------------------------------------" << endl;
    cout << "     n        O(n)耗时(ms)     O(n^2)耗时(ms)" << endl;

    for (long long m : {10000LL, 20000LL, 40000LL}) {
        double a = measureMs([&]{ sumOn(m); });
        double b = measureMs([&]{ sumOn2(m); });
        cout << "  " << m << "\t\t" << a << "\t\t" << b << endl;
    }
    cout << "  → n 翻倍时，O(n) 耗时约翻倍，O(n^2) 耗时约翻 4 倍" << endl << endl;

    // ---------- 演示 3：O(log n) 有多快 ----------
    cout << "【演示3】O(log n)：翻倍型循环" << endl;
    cout << "----------------------------------------" << endl;
    for (long long m : {1000LL, 1000000LL, 1000000000LL}) {
        cout << "  n = " << m << " 时，循环只执行 " << countLog(m) << " 次" << endl;
    }
    cout << "  → n 增长 100 万倍，执行次数只从 10 涨到 30！" << endl << endl;

    // ---------- 演示 4：不同复杂度的增长对比表 ----------
    cout << "【演示4】复杂度增长对照表（理论操作次数）" << endl;
    cout << "----------------------------------------" << endl;
    cout << "    n        log n        n          n log n      n^2" << endl;
    for (long long m : {10LL, 100LL, 1000LL, 10000LL}) {
        long long lg = countLog(m);
        cout << "  " << m << "\t\t" << lg << "\t\t" << m
             << "\t\t" << m * lg << "\t\t" << m * m << endl;
    }
    cout << endl;
    cout << "  → 注意 n^2 那一列增长得多快：n 从 10 到 10000，n^2 涨了 100 万倍" << endl;
    cout << "  → 这就是为什么排序要从 O(n^2) 优化到 O(n log n)" << endl << endl;

    cout << "========================================" << endl;
    cout << "  演示结束。核心结论：" << endl;
    cout << "  1. O(1) 最快，跟数据量无关" << endl;
    cout << "  2. O(log n) 极快，1 亿数据只要 27 次" << endl;
    cout << "  3. O(n) 随数据量线性增长" << endl;
    cout << "  4. O(n^2) 数据量一大就崩，要尽量避免" << endl;
    cout << "========================================" << endl;

    return 0;
}
