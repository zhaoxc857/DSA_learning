// ============================================================
// 01_STL入门.cpp
// 配套笔记：第 1 章 绪论 → 1.4 STL 与数据结构
//
// 目的：认识 STL 的三大组件——容器、算法、迭代器
//
// 编译运行：
//   g++ 01_STL入门.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <vector>        // 动态数组容器
#include <string>        // 字符串容器
#include <algorithm>     // 算法库（sort, find, reverse ...）
#include <map>           // 键值对容器
using namespace std;

int main() {
    cout << "========================================" << endl;
    cout << "  STL 三大组件入门演示" << endl;
    cout << "========================================" << endl << endl;

    // ========================================================
    // 一、容器 vector —— 会自动扩容的数组
    // ========================================================
    cout << "【一、容器 vector：动态数组】" << endl;
    cout << "----------------------------------------" << endl;

    vector<int> v;                  // 空的 vector
    v.push_back(5);                 // 尾部追加
    v.push_back(2);
    v.push_back(8);
    v.push_back(1);
    v.push_back(9);

    cout << "  元素个数 size() = " << v.size() << endl;
    cout << "  第一个元素 v[0] = " << v[0] << endl;
    cout << "  最后一个元素 v.back() = " << v.back() << endl;

    cout << "  原始顺序: ";
    for (int x : v) cout << x << " ";      // 范围 for（C++11）
    cout << endl << endl;

    // ========================================================
    // 二、算法 —— 对容器中数据的操作
    // ========================================================
    cout << "【二、算法：sort / find / reverse】" << endl;
    cout << "----------------------------------------" << endl;

    // ① 排序
    sort(v.begin(), v.end());              // 默认升序
    cout << "  sort 升序后: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    // ② 降序排序
    sort(v.begin(), v.end(), greater<int>());
    cout << "  sort 降序后: ";
    for (int x : v) cout << x << " ";
    cout << endl;

    // ③ 反转
    reverse(v.begin(), v.end());
    cout << "  reverse 后:  ";
    for (int x : v) cout << x << " ";
    cout << endl;

    // ④ 查找
    int target = 8;
    auto pos = find(v.begin(), v.end(), target);
    if (pos != v.end()) {
        // pos - v.begin() 得到下标
        cout << "  找到 " << target << "，下标 = " << (pos - v.begin()) << endl;
    } else {
        cout << "  没找到 " << target << endl;
    }

    // ⑤ 最大值/最小值
    cout << "  最大值 = " << *max_element(v.begin(), v.end())
         << "，最小值 = " << *min_element(v.begin(), v.end()) << endl << endl;

    // ========================================================
    // 三、迭代器 —— 连接容器和算法的桥梁
    // ========================================================
    cout << "【三、迭代器：像指针一样遍历】" << endl;
    cout << "----------------------------------------" << endl;

    vector<int> w = {10, 20, 30, 40};

    cout << "  用迭代器遍历: ";
    for (auto it = w.begin(); it != w.end(); ++it) {
        cout << *it << " ";                // *it 取出迭代器指向的值
    }
    cout << endl;

    cout << "  用下标遍历:   ";
    for (size_t i = 0; i < w.size(); i++) {
        cout << w[i] << " ";
    }
    cout << endl;

    cout << "  用范围for遍历: ";
    for (int x : w) cout << x << " ";
    cout << endl;

    cout << "  → 三种写法效果一样，迭代器最通用" << endl << endl;

    // ========================================================
    // 四、其他常用容器速览
    // ========================================================
    cout << "【四、其他容器速览】" << endl;
    cout << "----------------------------------------" << endl;

    // string：字符串
    string s = "hello";
    s += " world";                    // 拼接
    cout << "  string: \"" << s << "\"，长度 = " << s.length() << endl;
    cout << "  子串 substr(0,5) = \"" << s.substr(0, 5) << "\"" << endl;

    // map：键值对（类似字典）
    map<string, int> score;
    score["张三"] = 92;
    score["李四"] = 85;
    score["王五"] = 78;
    cout << "  map 遍历（按 key 自动排序）:" << endl;
    for (auto& kv : score) {
        cout << "    " << kv.first << " -> " << kv.second << endl;
    }
    cout << "  查张三的成绩: " << score["张三"] << endl << endl;

    // ========================================================
    // 五、对比：手写 vs STL
    // ========================================================
    cout << "【五、手写数组 vs STL vector】" << endl;
    cout << "----------------------------------------" << endl;

    // 手写方式：要自己维护数组和长度
    int arr[100];
    int n = 0;
    arr[n++] = 3;  arr[n++] = 1;  arr[n++] = 2;
    // 想再插入一个元素？得自己写循环搬数据……
    cout << "  手写数组: 需要自己管理长度 n = " << n << "，扩容很麻烦。当前内容: ";
    for (int i = 0; i < n; i++) cout << arr[i] << " ";
    cout << endl;

    // STL 方式：自动扩容，一行搞定
    vector<int> v2;
    for (int i = 0; i < 5; i++) v2.push_back(i * i);
    v2.insert(v2.begin() + 1, 999);   // 在下标 1 处插入，自动搬移后面的元素
    cout << "  STL vector: 自动扩容，插入后 = ";
    for (int x : v2) cout << x << " ";
    cout << endl;

    cout << endl << "========================================" << endl;
    cout << "  结论：" << endl;
    cout << "  1. STL 让我们不用重复造轮子" << endl;
    cout << "  2. 但必须懂底层原理，才知道该选哪个容器" << endl;
    cout << "  3. 本笔记的策略：先手写搞懂原理，再用 STL 提效" << endl;
    cout << "========================================" << endl;

    return 0;
}
