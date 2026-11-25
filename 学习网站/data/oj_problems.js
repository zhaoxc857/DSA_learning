// 《数据结构与算法》16 道「全手搓编程题（ACM/OJ 标准输入输出模式）」题库
// 覆盖全书第 0～7 章，从空白 main() 起步，不依赖 test_kit.h，支持本地 g++ 真编译多用例评测
// 暴露全局数组 window.DS_OJ_PROBLEMS
(function (global) {
  "use strict";

  var STARTER = [
    "#include <iostream>",
    "using namespace std;",
    "",
    "int main() {",
    "    // 从零开始写出你的完整 C++ 程序",
    "    return 0;",
    "}",
    ""
  ].join("\n");

  var problemsPart1 = [
    // ==================== oj01 (第0章 ★) ====================
    {
      id: "oj01",
      num: 1,
      chapterId: "00",
      difficulty: 1,
      title: "指针数组原地逆置与最值统计",
      tags: ["指针", "双指针", "数组", "防溢出"],
      summary: "用头尾指针原地反转动态数组，并统计最小值、最大值与元素总和。",
      description: "给定一个包含 $n$ 个整数的数组，请你从零编写程序：\n\n1. 使用**头尾双指针**（或数组下标）将数组**原地逆置**；\n2. 同时统计该数组的**最小值**、**最大值**和**所有元素之和**。\n\n> 💡 提醒：元素绝对值可达 $10^9$，求和变量请务必使用 `long long` 防止 32 位 `int` 溢出！",
      inputFormat: "第 1 行输入一个正整数 $n$（$1 \\le n \\le 10000$）。\n第 2 行输入 $n$ 个空格分隔的整数 $a_1, a_2, \\dots, a_n$。",
      outputFormat: "第 1 行输出原地逆置后的 $n$ 个整数（相邻数字以单个空格分隔）。\n第 2 行输出三个整数 `min max sum`，分别表示最小值、最大值和总和。",
      constraints: "$1 \\le n \\le 10000$，$-10^9 \\le a_i \\le 10^9$。",
      samples: [
        {
          input: "5\n1 3 5 7 9",
          output: "9 7 5 3 1\n1 9 25",
          explain: "原数组逆置后为 9 7 5 3 1；最小值 1，最大值 9，总和 25。"
        },
        {
          input: "4\n-5 10 0 -2",
          output: "-2 0 10 -5\n-5 10 3",
          explain: "支持负数统计，注意 min/max 应初始化为数组首个元素而非 0。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "动态申请数组或使用 vector<int> 读入后，令指针 int* l = a, *r = a + n - 1，当 l < r 时交换 *l 与 *r 并移动 l++、r--。",
        "统计 minVal、maxVal 时务必初始化为 a[0]（不要初始化为 0，否则全负数数组会出错）；sum 请用 long long 类型！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n;",
        "    if (!(cin >> n)) return 0;",
        "    vector<int> a(n);",
        "    for (int i = 0; i < n; i++) cin >> a[i];",
        "",
        "    int* l = a.data();",
        "    int* r = a.data() + n - 1;",
        "    while (l < r) {",
        "        int tmp = *l;",
        "        *l = *r;",
        "        *r = tmp;",
        "        l++;",
        "        r--;",
        "    }",
        "",
        "    int mn = a[0], mx = a[0];",
        "    long long sum = 0;",
        "    for (int i = 0; i < n; i++) {",
        "        if (a[i] < mn) mn = a[i];",
        "        if (a[i] > mx) mx = a[i];",
        "        sum += a[i];",
        "        if (i > 0) cout << ' ';",
        "        cout << a[i];",
        "    }",
        "    cout << '\\n' << mn << ' ' << mx << ' ' << sum << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：递增序列", input: "5\n1 3 5 7 9\n", expected: "9 7 5 3 1\n1 9 25" },
        { label: "样例2：含负数", input: "4\n-5 10 0 -2\n", expected: "-2 0 10 -5\n-5 10 3" },
        { label: "边界：单元素", input: "1\n-42\n", expected: "-42\n-42 -42 -42" },
        { label: "边界：全负数", input: "3\n-10 -20 -3\n", expected: "-3 -20 -10\n-20 -3 -33" },
        { label: "边界：全相等", input: "4\n7 7 7 7\n", expected: "7 7 7 7\n7 7 28" },
        { label: "极值：long long 防溢出", input: "4\n1000000000 1000000000 1000000000 -500000000\n", expected: "-500000000 1000000000 1000000000 1000000000\n-500000000 1000000000 2500000000" }
      ]
    },

    // ==================== oj02 (第1章 ★) ====================
    {
      id: "oj02",
      num: 2,
      chapterId: "01",
      difficulty: 1,
      title: "字符频次统计（教材例 1.8 全手搓版）",
      tags: ["计数数组", "ASCII", "字符串", "O(n)"],
      summary: "统计一整行字符串中所有可见 ASCII 字符的出现次数，并按 ASCII 升序输出。",
      description: "改编自教材第 1 章例 1.8：读入一整行字符串（可能包含空格、标点、数字和大小写字母），统计其中所有**可见 ASCII 字符**（ASCII 码范围 `33` 到 `126`，即不含空格、制表符和换行符）的出现次数。\n\n请以 $O(n)$ 时间复杂度完成统计，并按 ASCII 码从小到大的顺序输出每个出现过的字符及其次数。",
      inputFormat: "输入一整行字符串 $S$（可能为空行或全空格）。",
      outputFormat: "按 ASCII 码从小到大，每行输出 `字符 次数`（中间以单个空格分隔）。\n若整行不含任何可见 ASCII 字符，输出一行 `EMPTY`。",
      constraints: "$0 \\le |S| \\le 10^5$，时间复杂度要求 $O(|S|)$。",
      samples: [
        {
          input: "ababa 121",
          output: "1 2\n2 1\na 3\nb 2",
          explain: "空格不统计；数字 ASCII 码小于字母，故依次输出 '1', '2', 'a', 'b'。"
        },
        {
          input: "   ",
          output: "EMPTY",
          explain: "全部是空格，无可见 ASCII 字符，输出 EMPTY。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "使用 getline(cin, s) 读取整行，避免 cin >> s 在空格处截断。",
        "开 int cnt[128] = {0}; 遍历字符时务必先转 unsigned char c = static_cast<unsigned char>(ch)，再判断 33 <= c && c <= 126，彻底杜绝 char 负下标越界！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <string>",
        "using namespace std;",
        "",
        "int main() {",
        "    string s;",
        "    getline(cin, s);",
        "    int cnt[128] = {0};",
        "    for (size_t i = 0; i < s.size(); i++) {",
        "        unsigned char c = static_cast<unsigned char>(s[i]);",
        "        if (c >= 33 && c <= 126) {",
        "            cnt[c]++;",
        "        }",
        "    }",
        "    bool any = false;",
        "    for (int c = 33; c <= 126; c++) {",
        "        if (cnt[c] > 0) {",
        "            cout << static_cast<char>(c) << ' ' << cnt[c] << '\\n';",
        "            any = true;",
        "        }",
        "    }",
        "    if (!any) cout << \"EMPTY\\n\";",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：字母数字含空格", input: "ababa 121\n", expected: "1 2\n2 1\na 3\nb 2" },
        { label: "样例2：全空格", input: "   \n", expected: "EMPTY" },
        { label: "边界：完全空输入", input: "\n", expected: "EMPTY" },
        { label: "大小写与标点区分", input: "Hello, DS!\n", expected: "! 1\n, 1\nD 1\nH 1\nS 1\ne 1\nl 2\no 1" },
        { label: "边界：单字符重复", input: "zzzzz\n", expected: "z 5" },
        { label: "符号ASCII边界(!与~)", input: "~!~!\n", expected: "! 2\n~ 2" }
      ]
    },

    // ==================== oj03 (第2章 ★★) ====================
    {
      id: "oj03",
      num: 3,
      chapterId: "02",
      difficulty: 2,
      title: "合并两个非降序数组（双指针归并）",
      tags: ["顺序表", "双指针", "归并", "O(n+m)"],
      summary: "给定两个已按非降序排列的顺序表，用双指针在 O(n+m) 时间内归并为一个有序序列。",
      description: "给定两个非降序排列的整数序列 $A$（长度 $n$）和 $B$（长度 $m$），请你不使用 `std::sort`，而是手写**双指针归并**算法将它们合并为一个新的非降序序列并输出。\n\n> 💡 这是第 2 章顺序表有序合并与第 7 章归并排序的核心子过程，请务必练熟！",
      inputFormat: "第 1 行两个整数 $n, m$（$0 \\le n, m \\le 50000$，$n + m \\ge 1$）。\n接下来输入 $n$ 个非降序整数表示序列 $A$，再输入 $m$ 个非降序整数表示序列 $B$。",
      outputFormat: "一行输出合并后的 $n + m$ 个非降序整数，相邻数字以单个空格分隔。",
      constraints: "$0 \\le n, m \\le 50000$，$n + m \\ge 1$，$-10^9 \\le A_i, B_j \\le 10^9$。",
      samples: [
        {
          input: "3 4\n1 4 7\n2 3 4 9",
          output: "1 2 3 4 4 7 9",
          explain: "双指针 i、j 依次比较 A[i] 与 B[j]，将较小者放入结果数组，最后拼接剩余尾部。"
        },
        {
          input: "0 3\n-5 0 5",
          output: "-5 0 5",
          explain: "A 为空表时直接输出 B 的全部元素。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "设置双指针 i = 0, j = 0，当 i < n && j < m 时比较 A[i] <= B[j]，把较小者推入结果并推进对应指针。",
        "主循环结束后，别忘了用两个独立的 while (i < n) 和 while (j < m) 把未走完的尾巴全部拷贝进结果！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n, m;",
        "    if (!(cin >> n >> m)) return 0;",
        "    vector<int> a(n), b(m);",
        "    for (int i = 0; i < n; i++) cin >> a[i];",
        "    for (int j = 0; j < m; j++) cin >> b[j];",
        "",
        "    vector<int> res;",
        "    res.reserve(n + m);",
        "    int i = 0, j = 0;",
        "    while (i < n && j < m) {",
        "        if (a[i] <= b[j]) res.push_back(a[i++]);",
        "        else res.push_back(b[j++]);",
        "    }",
        "    while (i < n) res.push_back(a[i++]);",
        "    while (j < m) res.push_back(b[j++]);",
        "",
        "    for (size_t k = 0; k < res.size(); k++) {",
        "        if (k > 0) cout << ' ';",
        "        cout << res[k];",
        "    }",
        "    cout << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：交错合并", input: "3 4\n1 4 7\n2 3 4 9\n", expected: "1 2 3 4 4 7 9" },
        { label: "样例2：A为空表", input: "0 3\n-5 0 5\n", expected: "-5 0 5" },
        { label: "边界：B为空表", input: "3 0\n2 6 8\n", expected: "2 6 8" },
        { label: "边界：各1个元素", input: "1 1\n10\n-10\n", expected: "-10 10" },
        { label: "不相交两段", input: "3 3\n10 20 30\n1 2 3\n", expected: "1 2 3 10 20 30" },
        { label: "全相等重复值", input: "3 2\n5 5 5\n5 5\n", expected: "5 5 5 5 5" }
      ]
    },

    // ==================== oj04 (第2章 ★★) ====================
    {
      id: "oj04",
      num: 4,
      chapterId: "02",
      difficulty: 2,
      title: "单链表建表、按位删除与原地反转",
      tags: ["单链表", "指针", "尾插法", "三指针反转"],
      summary: "从零手写 struct Node，完成尾插建表、删除第 k 位节点、三指针原地反转并释放内存。",
      description: "请你从零定义单链表结构体 `struct Node { int data; Node* next; };`，依次完成以下 3 个核心链表操作：\n\n1. **尾插法建表**：将输入的 $n$ 个整数按顺序建成单链表；\n2. **按位删除**：给定 1-based 位序 $k$，若 $1 \\le k \\le n$ 则删除第 $k$ 个节点（释放内存）；若 $k$ 超出范围则忽略删除；\n3. **原地反转**：使用三指针法原地反转剩余链表并输出。\n\n若删除后链表为空，则输出 `EMPTY`。",
      inputFormat: "第 1 行一个正整数 $n$（$1 \\le n \\le 10000$）。\n第 2 行 $n$ 个整数。\n第 3 行一个整数 $k$（待删除的 1-based 位序，可能越界）。",
      outputFormat: "一行输出操作并反转后的链表元素（空格分隔）；若链表为空，输出 `EMPTY`。",
      constraints: "$1 \\le n \\le 10000$，$-10^9 \\le a_i \\le 10^9$，$0 \\le k \\le 20000$。",
      samples: [
        {
          input: "5\n10 20 30 40 50\n3",
          output: "50 40 20 10",
          explain: "删除第 3 个节点 30 后链表为 10→20→40→50，原地反转后为 50→40→20→10。"
        },
        {
          input: "1\n99\n1",
          output: "EMPTY",
          explain: "唯一节点被删除，链表变空，输出 EMPTY。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "引入哑巴头结点 dummy（dummy.next = nullptr）和尾指针 tail = &dummy，尾插和删除第 1 个节点都无需特判！",
        "三指针原地反转：prev = nullptr, cur = head；每步先 nxt = cur->next，再 cur->next = prev，然后 prev = cur, cur = nxt；最后别忘依次 delete 释放内存。"
      ],
      solutionCode: [
        "#include <iostream>",
        "using namespace std;",
        "",
        "struct Node {",
        "    int data;",
        "    Node* next;",
        "    Node(int d, Node* n = nullptr) : data(d), next(n) {}",
        "};",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n;",
        "    if (!(cin >> n)) return 0;",
        "    Node dummy(0);",
        "    Node* tail = &dummy;",
        "    for (int i = 0; i < n; i++) {",
        "        int x;",
        "        cin >> x;",
        "        tail->next = new Node(x);",
        "        tail = tail->next;",
        "    }",
        "    int k;",
        "    cin >> k;",
        "",
        "    if (k >= 1 && k <= n) {",
        "        Node* pre = &dummy;",
        "        for (int i = 1; i < k; i++) pre = pre->next;",
        "        Node* del = pre->next;",
        "        pre->next = del->next;",
        "        delete del;",
        "    }",
        "",
        "    Node* prev = nullptr;",
        "    Node* cur = dummy.next;",
        "    while (cur != nullptr) {",
        "        Node* nxt = cur->next;",
        "        cur->next = prev;",
        "        prev = cur;",
        "        cur = nxt;",
        "    }",
        "    Node* head = prev;",
        "",
        "    if (head == nullptr) {",
        "        cout << \"EMPTY\\n\";",
        "    } else {",
        "        bool first = true;",
        "        for (Node* p = head; p != nullptr; ) {",
        "            if (!first) cout << ' ';",
        "            cout << p->data;",
        "            first = false;",
        "            Node* nxt = p->next;",
        "            delete p;",
        "            p = nxt;",
        "        }",
        "        cout << '\\n';",
        "    }",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：删中间节点", input: "5\n10 20 30 40 50\n3\n", expected: "50 40 20 10" },
        { label: "样例2：单节点删空", input: "1\n99\n1\n", expected: "EMPTY" },
        { label: "边界：删首节点(k=1)", input: "4\n1 2 3 4\n1\n", expected: "4 3 2" },
        { label: "边界：删尾节点(k=n)", input: "4\n1 2 3 4\n4\n", expected: "3 2 1" },
        { label: "边界：k越界忽略删除", input: "3\n-5 0 8\n10\n", expected: "8 0 -5" },
        { label: "边界：k=0越界忽略", input: "2\n7 3\n0\n", expected: "3 7" }
      ]
    },

    // ==================== oj05 (第2章 ★★) ====================
    {
      id: "oj05",
      num: 5,
      chapterId: "02",
      difficulty: 2,
      title: "约瑟夫环出列顺序",
      tags: ["循环链表", "队列", "模拟"],
      summary: "编号 1~n 的人围成一圈，每报数到 m 者出列，输出完整出列序列。",
      description: "经典的**约瑟夫环（Josephus Problem）**：\n\n编号为 $1, 2, \\dots, n$ 的 $n$ 个人按顺时针围坐成一圈。从 $1$ 号开始从 $1$ 报数，每报到 $m$ 的人立刻出列，然后由下一个人重新从 $1$ 开始报数，直到所有人全部出列。\n\n请使用**循环链表**或**队列**模拟全过程，输出依次出列的编号序列。",
      inputFormat: "一行两个正整数 $n$ 和 $m$（$1 \\le n \\le 1000$，$1 \\le m \\le 1000$）。",
      outputFormat: "一行输出 $n$ 个整数，表示依次出列的人员编号（以单个空格分隔）。",
      constraints: "$1 \\le n \\le 1000$，$1 \\le m \\le 1000$。",
      samples: [
        {
          input: "5 2",
          output: "2 4 1 5 3",
          explain: "1→2(出)→3→4(出)→5→1(出)→3→5(出)→3(出)。"
        },
        {
          input: "7 3",
          output: "3 6 2 7 5 1 4",
          explain: "每数到 3 出列一人。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "队列模拟最简洁：先将 1..n 依次入队；每轮把前 (m-1) % q.size() 人出队再重新放回队尾，然后队头就是本轮出列者！",
        "若用循环链表，保留前驱指针 prev（初始指向尾节点 n），每轮移动 (m-1) 步后直接删除 prev->next 即可。"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <queue>",
        "using namespace std;",
        "",
        "int main() {",
        "    int n, m;",
        "    if (!(cin >> n >> m)) return 0;",
        "    queue<int> q;",
        "    for (int i = 1; i <= n; i++) q.push(i);",
        "    bool first = true;",
        "    while (!q.empty()) {",
        "        int steps = (m - 1) % static_cast<int>(q.size());",
        "        for (int s = 0; s < steps; s++) {",
        "            q.push(q.front());",
        "            q.pop();",
        "        }",
        "        if (!first) cout << ' ';",
        "        cout << q.front();",
        "        first = false;",
        "        q.pop();",
        "    }",
        "    cout << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：n=5, m=2", input: "5 2\n", expected: "2 4 1 5 3" },
        { label: "样例2：n=7, m=3", input: "7 3\n", expected: "3 6 2 7 5 1 4" },
        { label: "边界：m=1顺序出列", input: "6 1\n", expected: "1 2 3 4 5 6" },
        { label: "边界：n=1单人", input: "1 5\n", expected: "1" },
        { label: "绕多圈：m>n", input: "5 8\n", expected: "3 2 5 4 1" },
        { label: "中等规模：n=10, m=4", input: "10 4\n", expected: "4 8 2 7 3 10 9 1 6 5" }
      ]
    },

    // ==================== oj06 (第3章 ★★) ====================
    {
      id: "oj06",
      num: 6,
      chapterId: "03",
      difficulty: 2,
      title: "多类型括号合法性检验",
      tags: ["栈", "括号匹配", "边界判断"],
      summary: "给定多组表达式字符串，利用栈判断其中 () [] {} 三类括号是否完全正确嵌套配对。",
      description: "给定 $T$ 行字符串（每行可能包含 `()`、`[]`、`{}` 三种括号以及其他普通字符如字母、数字、运算符）。\n\n请你忽略非括号字符，用**栈（Stack）**检验每一行中的括号是否满足：\n1. 左括号必须用同类型的右括号闭合；\n2. 左括号必须以正确的顺序闭合（不能交叉错配）；\n3. 扫描结束时不能有多余的未闭合左括号。",
      inputFormat: "第 1 行一个正整数 $T$（$1 \\le T \\le 50$）。\n接下来 $T$ 行，每行一个非空字符串（长度 $\\le 10000$，不含空白字符）。",
      outputFormat: "输出 $T$ 行，第 $i$ 行若合法输出 `YES`，否则输出 `NO`。",
      constraints: "$1 \\le T \\le 50$，单行长度 $1 \\le |S| \\le 10000$。",
      samples: [
        {
          input: "4\n()[]{}\n([{}])\n([)]\n(((",
          output: "YES\nYES\nNO\nNO",
          explain: "前两组完全匹配；第 3 组交叉错配；第 4 组扫描结束栈非空。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "遇到左括号 ( [ { 入栈；遇到右括号时，必须先检查 if (st.empty()) return false，再比对栈顶是否为对应的左括号！",
        "整串遍历完后，不能直接返回 true，必须返回 st.empty()，才能拦住 \"(((\" 这种多余左括号！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <stack>",
        "#include <string>",
        "using namespace std;",
        "",
        "bool isValid(const string& s) {",
        "    stack<char> st;",
        "    for (size_t i = 0; i < s.size(); i++) {",
        "        char c = s[i];",
        "        if (c == '(' || c == '[' || c == '{') {",
        "            st.push(c);",
        "        } else if (c == ')' || c == ']' || c == '}') {",
        "            if (st.empty()) return false;",
        "            char t = st.top();",
        "            if ((c == ')' && t != '(') ||",
        "                (c == ']' && t != '[') ||",
        "                (c == '}' && t != '{')) {",
        "                return false;",
        "            }",
        "            st.pop();",
        "        }",
        "    }",
        "    return st.empty();",
        "}",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int T;",
        "    if (!(cin >> T)) return 0;",
        "    while (T--) {",
        "        string s;",
        "        cin >> s;",
        "        cout << (isValid(s) ? \"YES\" : \"NO\") << '\\n';",
        "    }",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：综合4组", input: "4\n()[]{}\n([{}])\n([)]\n(((\n", expected: "YES\nYES\nNO\nNO" },
        { label: "边界：多余右括号开头", input: "3\n)\n](\n{}\n", expected: "NO\nNO\nYES" },
        { label: "含表达式普通字符", input: "3\n(a+[b*{c+d}])\n(a+b]*c\nabc123\n", expected: "YES\nNO\nYES" },
        { label: "深层对称嵌套", input: "2\n((([[{{}}]])))()\n((([[{{}}]])))(\n", expected: "YES\nNO" },
        { label: "先闭合再非法", input: "2\n()[]}\n{[]}()[]\n", expected: "NO\nYES" }
      ]
    },

    // ==================== oj07 (第3章 ★★★) ====================
    {
      id: "oj07",
      num: 7,
      chapterId: "03",
      difficulty: 3,
      title: "逆波兰（后缀）表达式求值",
      tags: ["栈", "表达式求值", "负数处理"],
      summary: "解析并计算含负数与四则运算的逆波兰（后缀）表达式。",
      description: "给定一个合法的**逆波兰表达式（后缀表达式）**，由 $n$ 个空格分隔的标记（token）组成。每个标记要么是一个整数（可能为负数，例如 `-11`），要么是四种运算符 `+`、`-`、`*`、`/` 之一。\n\n请用**操作数栈**计算表达式的值并输出：\n- 减法与除法需注意**操作数顺序**：先弹出的是右操作数 $b$，后弹出的是左操作数 $a$，计算 $a - b$ 或 $a / b$；\n- 整数除法向零截断（与 C++ 内置 `/` 行为一致）；\n- 保证除数不为 $0$，且中间结果与最终结果均在 `long long` 范围内。",
      inputFormat: "第 1 行一个正整数 $n$（$1 \\le n \\le 1000$）。\n第 2 行 $n$ 个空格分隔的 token。",
      outputFormat: "一行输出一个整数，表示后缀表达式的计算结果。",
      constraints: "$1 \\le n \\le 1000$，中间结果与最终结果绝对值 $\\le 10^{18}$。",
      samples: [
        {
          input: "5\n2 1 + 3 *",
          output: "9",
          explain: "等价于 (2 + 1) * 3 = 9。"
        },
        {
          input: "5\n4 13 5 / +",
          output: "6",
          explain: "等价于 4 + (13 / 5) = 4 + 2 = 6。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "判断一个 token 是运算符还是负数：必须判断 token == \"-\"（长度为 1），千万不要只看 token[0] == '-'，否则会把负数 \"-11\" 误判成减号！",
        "弹出顺序极其关键：b = st.top(); st.pop(); a = st.top(); st.pop(); 再算 a - b 或 a / b，结果压栈（建议栈类型为 stack<long long>）。"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <stack>",
        "#include <string>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n;",
        "    if (!(cin >> n)) return 0;",
        "    stack<long long> st;",
        "    for (int i = 0; i < n; i++) {",
        "        string tok;",
        "        cin >> tok;",
        "        if (tok == \"+\" || tok == \"-\" || tok == \"*\" || tok == \"/\") {",
        "            long long b = st.top(); st.pop();",
        "            long long a = st.top(); st.pop();",
        "            if (tok == \"+\") st.push(a + b);",
        "            else if (tok == \"-\") st.push(a - b);",
        "            else if (tok == \"*\") st.push(a * b);",
        "            else st.push(a / b);",
        "        } else {",
        "            st.push(stoll(tok));",
        "        }",
        "    }",
        "    cout << st.top() << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：(2+1)*3", input: "5\n2 1 + 3 *\n", expected: "9" },
        { label: "样例2：4+(13/5)", input: "5\n4 13 5 / +\n", expected: "6" },
        { label: "综合：含负数与向零除法", input: "13\n10 6 9 3 + -11 * / * 17 + 5 +\n", expected: "22" },
        { label: "减法顺序验证：3-10", input: "3\n3 10 -\n", expected: "-7" },
        { label: "边界：单个负数", input: "1\n-42\n", expected: "-42" },
        { label: "大数乘法：long long", input: "3\n100000000 300000 *\n", expected: "30000000000000" }
      ]
    },

    // ==================== oj08 (第3章 ★★★) ====================
    {
      id: "oj08",
      num: 8,
      chapterId: "03",
      difficulty: 3,
      title: "KMP 模式匹配输出全部出现位置",
      tags: ["串", "KMP", "next数组", "O(n+m)"],
      summary: "手写 KMP 前缀函数 next[]，在线性时间 O(n+m) 内找出模式串在主串中的所有出现下标。",
      description: "给定主串 $S$ 与模式串 $P$，请你手写 **KMP 算法**（构建 `next` 数组 + 主串指针永不回溯匹配），找出 $P$ 在 $S$ 中**所有**出现位置的 **0-based 起始下标**（允许重叠匹配，例如 `\"aa\"` 在 `\"aaaa\"` 中出现在 `0 1 2`）。\n\n若主串中不存在模式串，请输出 `-1`。",
      inputFormat: "第 1 行输入主串 $S$（不含空白字符）。\n第 2 行输入模式串 $P$（不含空白字符）。",
      outputFormat: "一行按升序输出所有 0-based 匹配起始下标（以单个空格分隔）；若无匹配输出 `-1`。",
      constraints: "$1 \\le |S|, |P| \\le 10^5$，时间复杂度要求 $O(|S| + |P|)$。",
      samples: [
        {
          input: "ababcabcacbab\nabcac",
          output: "5",
          explain: "教材经典串，\"abcac\" 唯一出现在下标 5。"
        },
        {
          input: "aaaaa\naa",
          output: "0 1 2 3",
          explain: "允许重叠匹配：每匹配成功一次后，令 j = next[j - 1] 继续向后匹配！"
        }
      ],
      starterCode: STARTER,
      hints: [
        "0-based next[i] 表示 P[0..i] 的最长相等真前后缀长度；失配回退务必用 while (j > 0 && P[i] != P[j]) j = next[j - 1];（千万别写成 if！）。",
        "匹配主串时，一旦 j == P.size()，记录起始位置 i - j + 1，然后立刻回退 j = next[j - 1] 以支持重叠匹配！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <string>",
        "#include <vector>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    string s, p;",
        "    if (!(cin >> s >> p)) return 0;",
        "    int n = static_cast<int>(s.size());",
        "    int m = static_cast<int>(p.size());",
        "    vector<int> nxt(m, 0);",
        "    for (int i = 1, j = 0; i < m; i++) {",
        "        while (j > 0 && p[i] != p[j]) j = nxt[j - 1];",
        "        if (p[i] == p[j]) j++;",
        "        nxt[i] = j;",
        "    }",
        "    vector<int> ans;",
        "    for (int i = 0, j = 0; i < n; i++) {",
        "        while (j > 0 && s[i] != p[j]) j = nxt[j - 1];",
        "        if (s[i] == p[j]) j++;",
        "        if (j == m) {",
        "            ans.push_back(i - m + 1);",
        "            j = nxt[j - 1];",
        "        }",
        "    }",
        "    if (ans.empty()) {",
        "        cout << \"-1\\n\";",
        "    } else {",
        "        for (size_t k = 0; k < ans.size(); k++) {",
        "            if (k > 0) cout << ' ';",
        "            cout << ans[k];",
        "        }",
        "        cout << '\\n';",
        "    }",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：教材经典串", input: "ababcabcacbab\nabcac\n", expected: "5" },
        { label: "样例2：重叠匹配", input: "aaaaa\naa\n", expected: "0 1 2 3" },
        { label: "多级while回退测试", input: "abababacabababaca\nababaca\n", expected: "2 10" },
        { label: "边界：无匹配", input: "abcdefg\nxyz\n", expected: "-1" },
        { label: "边界：模式串长于主串", input: "abc\nabcd\n", expected: "-1" },
        { label: "边界：单字符模式串", input: "banana\na\n", expected: "1 3 5" }
      ]
    }
  ];

  global.__DS_OJ_PART1 = problemsPart1;
})(typeof window !== "undefined" ? window : globalThis);

(function (global) {
  "use strict";

  var STARTER = [
    "#include <iostream>",
    "using namespace std;",
    "",
    "int main() {",
    "    // 从零开始写出你的完整 C++ 程序",
    "    return 0;",
    "}",
    ""
  ].join("\n");

  var problemsPart2 = [
    // ==================== oj09 (第3章 ★★★) ====================
    {
      id: "oj09",
      num: 9,
      chapterId: "03",
      difficulty: 3,
      title: "0-1 背包最大总价值",
      tags: ["动态规划", "0-1背包", "滚动数组"],
      summary: "经典动态规划：给定 N 件物品的重量与价值及背包总容量 W，求最大总价值。",
      description: "有 $N$ 件物品和一个承重上限为 $W$ 的背包。第 $i$ 件物品的重量为 $w_i$、价值为 $v_i$，且每件物品**最多只能选择 1 次**（要么装入，要么不装）。\n\n请你使用**动态规划（DP）**求解在总重量不超过 $W$ 的前提下，能够装入背包的最大总价值。",
      inputFormat: "第 1 行两个整数 $N, W$（$1 \\le N \\le 200$，$0 \\le W \\le 10000$）。\n接下来 $N$ 行，每行两个整数 $w_i, v_i$（$1 \\le w_i \\le 10000$，$1 \\le v_i \\le 10^6$）。",
      outputFormat: "一行输出一个整数，表示最大总价值。",
      constraints: "$1 \\le N \\le 200$，$0 \\le W \\le 10000$，答案不超过 $2 \\times 10^8$。",
      samples: [
        {
          input: "4 8\n2 3\n3 4\n4 5\n5 6",
          output: "10",
          explain: "选重量 3（价值 4）与重量 5（价值 6），总重 8，总价值 10 为最优。"
        },
        {
          input: "3 50\n10 60\n20 100\n30 120",
          output: "220",
          explain: "贪心按性价比选 10+20 仅得 160，而 0-1 背包 DP 选 20+30 可得最大价值 220！"
        }
      ],
      starterCode: STARTER,
      hints: [
        "状态定义：dp[j] 表示背包容量为 j 时能获得的最大总价值，初始全为 0。",
        "一维滚动数组更新时，内层容量 j 必须从 W 倒序遍历到 w[i]（for (int j = W; j >= w[i]; j--) dp[j] = max(dp[j], dp[j - w[i]] + v[i]);），确保每件物品只被选一次！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "#include <algorithm>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int N, W;",
        "    if (!(cin >> N >> W)) return 0;",
        "    vector<long long> dp(W + 1, 0);",
        "    for (int i = 0; i < N; i++) {",
        "        int w; long long v;",
        "        cin >> w >> v;",
        "        for (int j = W; j >= w; j--) {",
        "            dp[j] = max(dp[j], dp[j - w] + v);",
        "        }",
        "    }",
        "    cout << dp[W] << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：标准4物品", input: "4 8\n2 3\n3 4\n4 5\n5 6\n", expected: "10" },
        { label: "样例2：破贪心经典反例", input: "3 50\n10 60\n20 100\n30 120\n", expected: "220" },
        { label: "边界：背包容量为0", input: "3 0\n1 10\n2 20\n3 30\n", expected: "0" },
        { label: "边界：全部超重装不下", input: "3 5\n6 100\n10 200\n8 150\n", expected: "0" },
        { label: "边界：全部都能装下", input: "3 20\n4 15\n5 25\n6 35\n", expected: "75" },
        { label: "边界：单物品刚好装满", input: "1 10\n10 999\n", expected: "999" }
      ]
    },

    // ==================== oj10 (第4章 ★★★) ====================
    {
      id: "oj10",
      num: 10,
      chapterId: "04",
      difficulty: 3,
      title: "已知前序与中序还原二叉树（输出后序与树高）",
      tags: ["二叉树", "分治递归", "遍历还原"],
      summary: "根据一棵二叉树的前序与中序遍历字符串，重建二叉树并输出其后序遍历序列与树高。",
      description: "给定一棵非空二叉树的**前序遍历**字符串 `pre` 和**中序遍历**字符串 `in`（每个节点用唯一的英文字母表示，互不重复）。\n\n请你利用“**前序定根、中序分左右**”的分治思想，还原这棵二叉树，并输出：\n1. 第 1 行：该二叉树的**后序遍历**字符串；\n2. 第 2 行：该二叉树的**高度**（单个节点的树高度为 `1`）。",
      inputFormat: "第 1 行输入前序遍历字符串 `pre`（仅含互不相同的英文字母）。\n第 2 行输入中序遍历字符串 `in`（与 `pre` 长度相同）。",
      outputFormat: "第 1 行输出后序遍历字符串。\n第 2 行输出一个整数表示二叉树高度。",
      constraints: "$1 \\le |\\text{pre}| = |\\text{in}| \\le 52$，保证输入能唯一还原合法二叉树。",
      samples: [
        {
          input: "ABDECF\nDBEAFC",
          output: "DEBFCA\n3",
          explain: "根为 A，左子树前序 BDE/中序 DBE（高 2），右子树前序 CF/中序 FC（高 2），整树高度为 3，后序为 DEBFCA。"
        },
        {
          input: "X\nX",
          output: "X\n1",
          explain: "单节点二叉树高度为 1。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "写递归函数 build(preL, preR, inL, inR)：若 preL > preR 返回高度 0；取 root = pre[preL]，在中序区间 [inL..inR] 找到 root 的下标 pos，左子树大小为 leftSize = pos - inL。",
        "左子树对应 pre[preL+1 .. preL+leftSize] 与 in[inL .. pos-1]，右子树对应 pre[preL+leftSize+1 .. preR] 与 in[pos+1 .. inR]。递归完左右子树后再把 root 追加到后序结果字符串即可！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <string>",
        "#include <algorithm>",
        "using namespace std;",
        "",
        "string preStr, inStr, postStr;",
        "",
        "int solve(int preL, int preR, int inL, int inR) {",
        "    if (preL > preR) return 0;",
        "    char root = preStr[preL];",
        "    int pos = inL;",
        "    while (pos <= inR && inStr[pos] != root) pos++;",
        "    int leftSize = pos - inL;",
        "    int lh = solve(preL + 1, preL + leftSize, inL, pos - 1);",
        "    int rh = solve(preL + leftSize + 1, preR, pos + 1, inR);",
        "    postStr.push_back(root);",
        "    return max(lh, rh) + 1;",
        "}",
        "",
        "int main() {",
        "    if (!(cin >> preStr >> inStr)) return 0;",
        "    int n = static_cast<int>(preStr.size());",
        "    int h = solve(0, n - 1, 0, n - 1);",
        "    cout << postStr << '\\n' << h << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：经典6节点树", input: "ABDECF\nDBEAFC\n", expected: "DEBFCA\n3" },
        { label: "样例2：单节点", input: "X\nX\n", expected: "X\n1" },
        { label: "满二叉树7节点", input: "ABDECFG\nDBEAFCG\n", expected: "DEBFGCA\n3" },
        { label: "边界：纯左斜退化链", input: "ABCD\nDCBA\n", expected: "DCBA\n4" },
        { label: "边界：纯右斜退化链", input: "ABCD\nABCD\n", expected: "DCBA\n4" },
        { label: "非对称深树", input: "ABDGCEHIF\nDGBAEHICF\n", expected: "GDBIHEFCA\n5" }
      ]
    },

    // ==================== oj11 (第4章 ★★★) ====================
    {
      id: "oj11",
      num: 11,
      chapterId: "04",
      difficulty: 3,
      title: "哈夫曼树最小带权路径长度 WPL",
      tags: ["哈夫曼树", "小根堆", "贪心"],
      summary: "给定 n 个叶子权值，用小根堆模拟哈夫曼树构造过程并计算最小 WPL。",
      description: "给定 $n$ 个叶子节点的正整数权值 $w_1, w_2, \\dots, w_n$，请你构造一棵**哈夫曼树（最优二叉树）**，并输出其最小**带权路径长度（WPL）**。\n\n> 💡 教材黄金性质：**哈夫曼树的 WPL = 构造过程中所有合并产生的非叶节点权值之和！**\n> 若 $n = 1$（只有 1 个叶子无需合并），约定 WPL 为 `0`。",
      inputFormat: "第 1 行一个正整数 $n$（$1 \\le n \\le 10^5$）。\n第 2 行 $n$ 个正整数 $w_1, w_2, \\dots, w_n$（$1 \\le w_i \\le 10^6$）。",
      outputFormat: "一行输出一个整数（使用 `long long`），表示最小 WPL。",
      constraints: "$1 \\le n \\le 10^5$，$1 \\le w_i \\le 10^6$，注意用 `long long` 存储累加和与堆元素。",
      samples: [
        {
          input: "4\n2 3 4 7",
          output: "30",
          explain: "依次合并 2+3=5、4+5=9、7+9=16，WPL = 5 + 9 + 16 = 30。"
        },
        {
          input: "8\n5 29 7 8 14 23 3 11",
          output: "271",
          explain: "教材与笔记经典 8 叶子哈夫曼树，WPL = 271。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "使用小根堆：priority_queue<long long, vector<long long>, greater<long long>> pq; 将所有权值入堆。",
        "只要 pq.size() > 1，就弹出最小的两个数 a、b，将合并值 s = a + b 累加到 wpl，并把 s 重新压回堆中！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <queue>",
        "#include <vector>",
        "#include <functional>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n;",
        "    if (!(cin >> n)) return 0;",
        "    priority_queue<long long, vector<long long>, greater<long long>> pq;",
        "    for (int i = 0; i < n; i++) {",
        "        long long w;",
        "        cin >> w;",
        "        pq.push(w);",
        "    }",
        "    long long wpl = 0;",
        "    while (pq.size() > 1) {",
        "        long long a = pq.top(); pq.pop();",
        "        long long b = pq.top(); pq.pop();",
        "        long long s = a + b;",
        "        wpl += s;",
        "        pq.push(s);",
        "    }",
        "    cout << wpl << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：教材{2,3,4,7}", input: "4\n2 3 4 7\n", expected: "30" },
        { label: "样例2：笔记8权值", input: "8\n5 29 7 8 14 23 3 11\n", expected: "271" },
        { label: "边界：单节点n=1", input: "1\n100\n", expected: "0" },
        { label: "边界：两节点n=2", input: "2\n10 20\n", expected: "30" },
        { label: "全相等权值", input: "4\n5 5 5 5\n", expected: "40" },
        { label: "大权值防溢出", input: "5\n1000000 1000000 1000000 1000000 1000000\n", expected: "12000000" }
      ]
    },

    // ==================== oj12 (第5章 ★★★) ====================
    {
      id: "oj12",
      num: 12,
      chapterId: "05",
      difficulty: 3,
      title: "无向图连通分量数与两点最短步数（BFS）",
      tags: ["图", "邻接表", "BFS", "连通分量"],
      summary: "构建无向图邻接表，统计整张图的连通分量个数，并用 BFS 求起点 s 到终点 t 的最少边数。",
      description: "给定一个包含 $n$ 个顶点（编号 `0` 到 `n-1`）和 $m$ 条无向边的无向图（图可能**非连通**，可能包含重边或自环），以及起点 $s$ 和终点 $t$。\n\n请你使用**邻接表**存图，并完成两项任务：\n1. 统计该无向图共有多少个**连通分量**；\n2. 利用 **BFS（广度优先搜索）** 求出从 $s$ 到 $t$ 的**最少边数**（若 $s = t$ 则步数为 `0`；若 $s$ 无法到达 $t$ 则输出 `-1`）。",
      inputFormat: "第 1 行四个整数 $n, m, s, t$（$1 \\le n \\le 1000$，$0 \\le m \\le 50000$，$0 \\le s, t < n$）。\n接下来 $m$ 行，每行两个整数 $u, v$（$0 \\le u, v < n$）表示一条无向边。",
      outputFormat: "一行输出两个整数 `components dist`（以单个空格分隔）。",
      constraints: "$1 \\le n \\le 1000$，$0 \\le m \\le 50000$。",
      samples: [
        {
          input: "6 5 0 3\n0 1\n1 2\n2 3\n0 2\n4 5",
          output: "2 2",
          explain: "图有 2 个连通分量 {0,1,2,3} 与 {4,5}；0→2→3 仅需 2 步（比 0→1→2→3 更短）。"
        },
        {
          input: "4 2 0 3\n0 1\n2 3",
          output: "2 -1",
          explain: "0 与 3 不在同一个连通分量中，最短步数为 -1。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "无向图加边切记双向都加：adj[u].push_back(v); adj[v].push_back(u);！",
        "统计连通分量用外层 for (int i = 0; i < n; i++) 若 !vis[i] 则 comp++ 并从 i 启动一次 BFS/DFS；求最短步数时，BFS 必须在入队瞬间标记 dist[v] = dist[u] + 1，绝不要等到出队才标！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "#include <queue>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n, m, s, t;",
        "    if (!(cin >> n >> m >> s >> t)) return 0;",
        "    vector<vector<int>> adj(n);",
        "    for (int i = 0; i < m; i++) {",
        "        int u, v;",
        "        cin >> u >> v;",
        "        adj[u].push_back(v);",
        "        adj[v].push_back(u);",
        "    }",
        "",
        "    vector<bool> vis(n, false);",
        "    int comp = 0;",
        "    for (int i = 0; i < n; i++) {",
        "        if (!vis[i]) {",
        "            comp++;",
        "            queue<int> q;",
        "            vis[i] = true;",
        "            q.push(i);",
        "            while (!q.empty()) {",
        "                int u = q.front(); q.pop();",
        "                for (size_t k = 0; k < adj[u].size(); k++) {",
        "                    int v = adj[u][k];",
        "                    if (!vis[v]) {",
        "                        vis[v] = true;",
        "                        q.push(v);",
        "                    }",
        "                }",
        "            }",
        "        }",
        "    }",
        "",
        "    vector<int> dist(n, -1);",
        "    queue<int> q;",
        "    dist[s] = 0;",
        "    q.push(s);",
        "    while (!q.empty()) {",
        "        int u = q.front(); q.pop();",
        "        if (u == t) break;",
        "        for (size_t k = 0; k < adj[u].size(); k++) {",
        "            int v = adj[u][k];",
        "            if (dist[v] == -1) {",
        "                dist[v] = dist[u] + 1;",
        "                q.push(v);",
        "            }",
        "        }",
        "    }",
        "",
        "    cout << comp << ' ' << dist[t] << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：两连通块+捷径", input: "6 5 0 3\n0 1\n1 2\n2 3\n0 2\n4 5\n", expected: "2 2" },
        { label: "样例2：不可达", input: "4 2 0 3\n0 1\n2 3\n", expected: "2 -1" },
        { label: "边界：起点等于终点", input: "5 2 2 2\n0 1\n3 4\n", expected: "3 0" },
        { label: "边界：无边全孤立点", input: "4 0 0 1\n", expected: "4 -1" },
        { label: "含环重边与自环", input: "4 6 0 3\n0 0\n0 1\n0 1\n1 2\n2 0\n2 3\n", expected: "1 2" },
        { label: "单顶点图", input: "1 0 0 0\n", expected: "1 0" }
      ]
    },

    // ==================== oj13 (第5章 ★★★) ====================
    {
      id: "oj13",
      num: 13,
      chapterId: "05",
      difficulty: 3,
      title: "带权有向图单源最短路径（Dijkstra）",
      tags: ["图", "Dijkstra", "最短路径", "优先队列"],
      summary: "实现非负权有向图的 Dijkstra 单源最短路径算法，输出起点到所有顶点的最短距离。",
      description: "给定一个包含 $n$ 个顶点（编号 `0` 到 `n-1`）和 $m$ 条**非负权有向边**的有向图（可能存在重边），以及源点 $s$。\n\n请你编写 **Dijkstra 算法**（朴素 $O(n^2)$ 或堆优化 $O((n+m)\\log n)$ 均可），计算源点 $s$ 到每个顶点 $0, 1, \\dots, n-1$ 的最短路径长度。若某个顶点不可达，则对应位置输出 `-1`。",
      inputFormat: "第 1 行三个整数 $n, m, s$（$1 \\le n \\le 1000$，$0 \\le m \\le 50000$，$0 \\le s < n$）。\n接下来 $m$ 行，每行三个整数 $u, v, w$（$0 \\le u, v < n$，$0 \\le w \\le 10^6$），表示一条从 $u$ 指向 $v$、边权为 $w$ 的有向边。",
      outputFormat: "一行输出 $n$ 个整数，依次为 $s$ 到顶点 $0, 1, \\dots, n-1$ 的最短距离（以单个空格分隔，不可达输出 `-1`）。",
      constraints: "$1 \\le n \\le 1000$，$0 \\le m \\le 50000$，$0 \\le w \\le 10^6$，注意用 `long long` 防止距离累加溢出。",
      samples: [
        {
          input: "5 7 0\n0 1 10\n0 3 5\n1 2 1\n1 3 2\n3 1 3\n3 2 9\n3 4 2",
          output: "0 8 9 5 7",
          explain: "0→3(5)→1(8)→2(9)，0→3→4(7)。"
        },
        {
          input: "4 2 0\n0 1 4\n2 3 1",
          output: "0 4 -1 -1",
          explain: "顶点 2、3 不可达，输出 -1。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "设置无穷大 const long long INF = (1LL << 60); 并初始化 dist[s] = 0。切忌把 INT_MAX 直接拿来做加法，否则会整型溢出变成负数！",
        "推荐使用堆优化 Dijkstra：小根堆存 pair<long long, int>(距离, 顶点)，弹出时若 d > dist[u] 直接 continue 跳过过期旧记录。"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "#include <queue>",
        "#include <utility>",
        "#include <functional>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n, m, s;",
        "    if (!(cin >> n >> m >> s)) return 0;",
        "    vector<vector<pair<int, int>>> adj(n);",
        "    for (int i = 0; i < m; i++) {",
        "        int u, v, w;",
        "        cin >> u >> v >> w;",
        "        adj[u].push_back(make_pair(v, w));",
        "    }",
        "    const long long INF = (1LL << 60);",
        "    vector<long long> dist(n, INF);",
        "    typedef pair<long long, int> State;",
        "    priority_queue<State, vector<State>, greater<State>> pq;",
        "    dist[s] = 0;",
        "    pq.push(make_pair(0LL, s));",
        "    while (!pq.empty()) {",
        "        State cur = pq.top(); pq.pop();",
        "        long long d = cur.first;",
        "        int u = cur.second;",
        "        if (d > dist[u]) continue;",
        "        for (size_t i = 0; i < adj[u].size(); i++) {",
        "            int v = adj[u][i].first;",
        "            int w = adj[u][i].second;",
        "            if (dist[u] + w < dist[v]) {",
        "                dist[v] = dist[u] + w;",
        "                pq.push(make_pair(dist[v], v));",
        "            }",
        "        }",
        "    }",
        "    for (int i = 0; i < n; i++) {",
        "        if (i > 0) cout << ' ';",
        "        cout << (dist[i] == INF ? -1 : dist[i]);",
        "    }",
        "    cout << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：经典5点有向网", input: "5 7 0\n0 1 10\n0 3 5\n1 2 1\n1 3 2\n3 1 3\n3 2 9\n3 4 2\n", expected: "0 8 9 5 7" },
        { label: "样例2：含不可达顶点", input: "4 2 0\n0 1 4\n2 3 1\n", expected: "0 4 -1 -1" },
        { label: "有向边方向性检验", input: "3 2 1\n0 1 5\n1 2 3\n", expected: "-1 0 3" },
        { label: "重边取最短边", input: "3 4 0\n0 1 100\n0 1 2\n1 2 50\n1 2 3\n", expected: "0 2 5" },
        { label: "边界：单顶点无边", input: "1 0 0\n", expected: "0" },
        { label: "0权边与多步松弛", input: "4 5 0\n0 1 0\n1 2 0\n0 3 10\n2 3 1\n1 3 5\n", expected: "0 0 0 1" }
      ]
    },

    // ==================== oj14 (第5章 ★★★) ====================
    {
      id: "oj14",
      num: 14,
      chapterId: "05",
      difficulty: 3,
      title: "课程表最小字典序拓扑排序与判环",
      tags: ["图", "拓扑排序", "AOV网", "判环"],
      summary: "使用 Kahn 算法 + 小根堆求有向图字典序最小的拓扑序列，若存在循环依赖则输出 CYCLE。",
      description: "某学院开设了 $n$ 门课程（编号 `0` 到 `n-1`），共有 $m$ 条先修依赖关系 `u v`，表示必须**先修完课程 `u`，才能修课程 `v`**（有向边 $u \\to v$）。\n\n请你使用 **Kahn 拓扑排序算法**：\n- 如果存在合法的修课顺序，请在所有合法拓扑序列中输出**字典序最小**的那一个（即每当有多门课程同时满足入度为 0 时，优先选编号最小的课程）；\n- 如果课程依赖关系中存在**有向环**（循环依赖导致无法全部修完），则输出 `CYCLE`。",
      inputFormat: "第 1 行两个整数 $n, m$（$1 \\le n \\le 1000$，$0 \\le m \\le 50000$）。\n接下来 $m$ 行，每行两个整数 $u, v$（$0 \\le u, v < n$）表示有向先修边 $u \\to v$。",
      outputFormat: "若无环，一行输出 $n$ 个整数（最小字典序拓扑序列，空格分隔）；若有环，输出一行 `CYCLE`。",
      constraints: "$1 \\le n \\le 1000$，$0 \\le m \\le 50000$。",
      samples: [
        {
          input: "4 4\n0 2\n1 2\n2 3\n1 3",
          output: "0 1 2 3",
          explain: "初始入度为 0 的有 0 和 1，优先选编号更小的 0，再选 1，然后 2 入度归 0，最后 3。"
        },
        {
          input: "3 3\n0 1\n1 2\n2 0",
          output: "CYCLE",
          explain: "0→1→2→0 形成有向环，最终输出顶点数 0 < 3，判定为 CYCLE。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "统计每个顶点的入度 indeg[v]，将所有 indeg[i] == 0 的顶点压入小根堆 priority_queue<int, vector<int>, greater<int>>（而不是普通队列，这样就能保证字典序最小！）。",
        "每次弹出堆顶 u 加入结果数组 order，遍历邻居 v 执行 if (--indeg[v] == 0) pq.push(v);。循环结束后检查 order.size() == n，若小于 n 说明图中必有环！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "#include <queue>",
        "#include <functional>",
        "using namespace std;",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n, m;",
        "    if (!(cin >> n >> m)) return 0;",
        "    vector<vector<int>> adj(n);",
        "    vector<int> indeg(n, 0);",
        "    for (int i = 0; i < m; i++) {",
        "        int u, v;",
        "        cin >> u >> v;",
        "        adj[u].push_back(v);",
        "        indeg[v]++;",
        "    }",
        "    priority_queue<int, vector<int>, greater<int>> pq;",
        "    for (int i = 0; i < n; i++) {",
        "        if (indeg[i] == 0) pq.push(i);",
        "    }",
        "    vector<int> order;",
        "    while (!pq.empty()) {",
        "        int u = pq.top(); pq.pop();",
        "        order.push_back(u);",
        "        for (size_t i = 0; i < adj[u].size(); i++) {",
        "            int v = adj[u][i];",
        "            if (--indeg[v] == 0) pq.push(v);",
        "        }",
        "    }",
        "    if (static_cast<int>(order.size()) < n) {",
        "        cout << \"CYCLE\\n\";",
        "    } else {",
        "        for (int i = 0; i < n; i++) {",
        "            if (i > 0) cout << ' ';",
        "            cout << order[i];",
        "        }",
        "        cout << '\\n';",
        "    }",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：菱形DAG最小字典序", input: "4 4\n0 2\n1 2\n2 3\n1 3\n", expected: "0 1 2 3" },
        { label: "样例2：三元有向环", input: "3 3\n0 1\n1 2\n2 0\n", expected: "CYCLE" },
        { label: "小字典序优先级检验", input: "5 3\n4 0\n3 1\n2 0\n", expected: "2 3 1 4 0" },
        { label: "局部有环+独立无环点", input: "4 3\n0 1\n2 3\n3 2\n", expected: "CYCLE" },
        { label: "边界：无任何先修边", input: "4 0\n", expected: "0 1 2 3" },
        { label: "边界：自环判环", input: "2 1\n1 1\n", expected: "CYCLE" }
      ]
    },

    // ==================== oj15 (第6章 ★★★) ====================
    {
      id: "oj15",
      num: 15,
      chapterId: "06",
      difficulty: 3,
      title: "有序数组二分查找目标首个与末个下标",
      tags: ["折半查找", "二分边界", "O(log n)"],
      summary: "手写左右边界二分查找，在非降序数组中以 O(log n) 定位目标值的首次与末次出现位置。",
      description: "给定一个长度为 $n$ 的**非降序**整数数组 $A$（下标从 `0` 开始，可能包含大量重复元素）以及 $q$ 次查询。\n\n对于每次查询的目标值 $x$，请你手写**二分查找**（左右边界二分），以 $O(\\log n)$ 的单次查询复杂度找出 $x$ 在数组中**第一次出现**和**最后一次出现**的 0-based 下标；如果 $x$ 不存在，则输出 `-1 -1`。",
      inputFormat: "第 1 行两个正整数 $n, q$（$1 \\le n \\le 10^5$，$1 \\le q \\le 1000$）。\n第 2 行 $n$ 个非降序整数。\n接下来 $q$ 行，每行一个待查询整数 $x$。",
      outputFormat: "共输出 $q$ 行，每行两个整数 `first last`（空格分隔）；若未找到则输出 `-1 -1`。",
      constraints: "$1 \\le n \\le 10^5$，$1 \\le q \\le 1000$，$-10^9 \\le A_i, x \\le 10^9$。",
      samples: [
        {
          input: "7 3\n1 2 2 2 5 7 9\n2\n5\n4",
          output: "1 3\n4 4\n-1 -1",
          explain: "2 出现在下标 1..3；5 仅在下标 4；4 不存在故输出 -1 -1。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "找左边界（第一个 >= x）：在 while (low <= high) 中，若 a[mid] >= x 则记录 ans = mid 并继续向左收缩 high = mid - 1；否则 low = mid + 1。最后检查 ans != -1 && a[ans] == x。",
        "找右边界（最后一个 <= x）：当 a[mid] <= x 时记录 ans = mid 并向右扩展 low = mid + 1；否则 high = mid - 1。切记 mid = low + (high - low) / 2 防溢出！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "using namespace std;",
        "",
        "int findFirst(const vector<int>& a, int x) {",
        "    int low = 0, high = static_cast<int>(a.size()) - 1, ans = -1;",
        "    while (low <= high) {",
        "        int mid = low + (high - low) / 2;",
        "        if (a[mid] == x) {",
        "            ans = mid;",
        "            high = mid - 1;",
        "        } else if (a[mid] < x) {",
        "            low = mid + 1;",
        "        } else {",
        "            high = mid - 1;",
        "        }",
        "    }",
        "    return ans;",
        "}",
        "",
        "int findLast(const vector<int>& a, int x) {",
        "    int low = 0, high = static_cast<int>(a.size()) - 1, ans = -1;",
        "    while (low <= high) {",
        "        int mid = low + (high - low) / 2;",
        "        if (a[mid] == x) {",
        "            ans = mid;",
        "            low = mid + 1;",
        "        } else if (a[mid] < x) {",
        "            low = mid + 1;",
        "        } else {",
        "            high = mid - 1;",
        "        }",
        "    }",
        "    return ans;",
        "}",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n, q;",
        "    if (!(cin >> n >> q)) return 0;",
        "    vector<int> a(n);",
        "    for (int i = 0; i < n; i++) cin >> a[i];",
        "    while (q--) {",
        "        int x;",
        "        cin >> x;",
        "        int l = findFirst(a, x);",
        "        if (l == -1) cout << \"-1 -1\\n\";",
        "        else cout << l << ' ' << findLast(a, x) << '\\n';",
        "    }",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：重复与不存在", input: "7 3\n1 2 2 2 5 7 9\n2\n5\n4\n", expected: "1 3\n4 4\n-1 -1" },
        { label: "边界：首尾端点查询", input: "5 4\n10 10 20 30 30\n10\n30\n5\n40\n", expected: "0 1\n3 4\n-1 -1\n-1 -1" },
        { label: "边界：全相等数组", input: "6 2\n7 7 7 7 7 7\n7\n8\n", expected: "0 5\n-1 -1" },
        { label: "边界：单元素数组", input: "1 3\n-5\n-5\n-6\n0\n", expected: "0 0\n-1 -1\n-1 -1" },
        { label: "含负数与极值", input: "6 3\n-1000000000 -5 -5 0 1000000000 1000000000\n-1000000000\n-5\n1000000000\n", expected: "0 0\n1 2\n4 5" }
      ]
    },

    // ==================== oj16 (第7章 ★★★) ====================
    {
      id: "oj16",
      num: 16,
      chapterId: "07",
      difficulty: 3,
      title: "手写归并排序并统计逆序对总数",
      tags: ["归并排序", "分治", "逆序对", "O(n log n)"],
      summary: "手写二路归并排序完成升序排列，同时利用归并过程以 O(n log n) 统计逆序对总数。",
      description: "给定一个长度为 $n$ 的整数数组 $a_0, a_1, \\dots, a_{n-1}$，请你手写 **二路归并排序**（不调用 `std::sort`）将其按升序排列，并同时统计原数组中的**逆序对总数**。\n\n> **逆序对定义**：满足下标 $i < j$ 且数值 $a_i > a_j$ 的下标对 $(i, j)$ 的总个数。\n> 💡 当 $n = 10^5$ 且数组完全逆序时，逆序对总数可达 $\\frac{n(n-1)}{2} \\approx 5 \\times 10^9$，请务必使用 `long long` 统计！",
      inputFormat: "第 1 行一个正整数 $n$（$1 \\le n \\le 10^5$）。\n第 2 行 $n$ 个整数 $a_0, a_1, \\dots, a_{n-1}$。",
      outputFormat: "第 1 行输出升序排序后的 $n$ 个整数（以单个空格分隔）。\n第 2 行输出一个整数，表示原数组的逆序对总数。",
      constraints: "$1 \\le n \\le 10^5$，$-10^9 \\le a_i \\le 10^9$，时间复杂度要求 $O(n \\log n)$。",
      samples: [
        {
          input: "5\n2 4 1 3 5",
          output: "1 2 3 4 5\n3",
          explain: "逆序对为 (2,1)、(4,1)、(4,3)，共 3 对。"
        },
        {
          input: "5\n5 4 3 2 1",
          output: "1 2 3 4 5\n10",
          explain: "完全逆序数组逆序对数为 5×4/2 = 10。"
        }
      ],
      starterCode: STARTER,
      hints: [
        "在二路归并合并 [low..mid] 与 [mid+1..high] 时：若 a[i] <= a[j]（必须用 <= 保证相等元素不算逆序对且排序稳定！），直接取 a[i++]；",
        "若 a[i] > a[j]，由于左半段 [i..mid] 已升序，说明 a[i..mid] 全部严格大于 a[j]，瞬间贡献 (mid - i + 1) 个逆序对！合并完别忘把 temp[low..high] 拷回 a[low..high]！"
      ],
      solutionCode: [
        "#include <iostream>",
        "#include <vector>",
        "using namespace std;",
        "",
        "long long mergeSort(vector<int>& a, vector<int>& tmp, int low, int high) {",
        "    if (low >= high) return 0;",
        "    int mid = low + (high - low) / 2;",
        "    long long inv = mergeSort(a, tmp, low, mid) + mergeSort(a, tmp, mid + 1, high);",
        "    int i = low, j = mid + 1, k = low;",
        "    while (i <= mid && j <= high) {",
        "        if (a[i] <= a[j]) {",
        "            tmp[k++] = a[i++];",
        "        } else {",
        "            tmp[k++] = a[j++];",
        "            inv += (mid - i + 1);",
        "        }",
        "    }",
        "    while (i <= mid) tmp[k++] = a[i++];",
        "    while (j <= high) tmp[k++] = a[j++];",
        "    for (int t = low; t <= high; t++) a[t] = tmp[t];",
        "    return inv;",
        "}",
        "",
        "int main() {",
        "    ios::sync_with_stdio(false);",
        "    cin.tie(nullptr);",
        "    int n;",
        "    if (!(cin >> n)) return 0;",
        "    vector<int> a(n), tmp(n);",
        "    for (int i = 0; i < n; i++) cin >> a[i];",
        "    long long inv = mergeSort(a, tmp, 0, n - 1);",
        "    for (int i = 0; i < n; i++) {",
        "        if (i > 0) cout << ' ';",
        "        cout << a[i];",
        "    }",
        "    cout << '\\n' << inv << '\\n';",
        "    return 0;",
        "}",
        ""
      ].join("\n"),
      testCases: [
        { label: "样例1：常规5元素", input: "5\n2 4 1 3 5\n", expected: "1 2 3 4 5\n3" },
        { label: "样例2：完全逆序", input: "5\n5 4 3 2 1\n", expected: "1 2 3 4 5\n10" },
        { label: "边界：已升序(0逆序)", input: "6\n-3 -1 0 2 5 9\n", expected: "-3 -1 0 2 5 9\n0" },
        { label: "边界：全相等(检验<=稳定性)", input: "5\n7 7 7 7 7\n", expected: "7 7 7 7 7\n0" },
        { label: "边界：单元素", input: "1\n42\n", expected: "42\n0" },
        { label: "混合负数与重复值", input: "8\n3 -2 5 3 -2 0 1 -5\n", expected: "-5 -2 -2 0 1 3 3 5\n18" }
      ]
    }
  ];

  global.DS_OJ_PROBLEMS = (global.__DS_OJ_PART1 || []).concat(problemsPart2);
  delete global.__DS_OJ_PART1;
})(typeof window !== "undefined" ? window : globalThis);
