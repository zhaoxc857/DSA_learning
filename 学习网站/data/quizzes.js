// 《数据结构与算法》（徐雅静）交互式题库、找 Bug 诊所病例与 3D 翻转闪卡
// 纯离线全局数据文件，挂载至 window.DS_QUIZZES
(function (global) {
  "use strict";

  var questions = [
    // ==================== 第 0 章：C 与 C++ 基础回顾 (10 题) ====================
    {
      id: "q-00-01",
      chapterId: "00",
      difficulty: 1,
      type: "single",
      prompt: "关于 C++ 中指针（Pointer）与引用（Reference）的区别，以下说法错误的是哪一项？",
      code: "",
      options: [
        "A. 引用在定义时必须初始化，且绑定后不能再改绑其他变量",
        "B. 指针可以赋值为 nullptr，也可以在运行期间重新指向别的地址",
        "C. 对指针使用 sizeof 得到指针自身大小，对引用使用 sizeof 得到被引用对象的大小",
        "D. 引用可以在定义后先留空，等运行时再决定绑定到哪个变量"
      ],
      answer: 3,
      explanation: "引用本质上是已有变量的“别名”，定义时必须立即初始化（如 int& r = a;），不能存在“空引用”，也不能中途改绑其他变量。因此 D 错误。",
      tag: "指针与引用"
    },
    {
      id: "q-00-02",
      chapterId: "00",
      difficulty: 2,
      type: "single",
      prompt: "执行下方函数 pushFront(head, 10) 后，主函数中原本为 nullptr 的头指针 head 会发生什么变化？",
      code: "struct Node { int data; Node* next; };\nvoid pushFront(Node* head, int x) {\n    Node* s = new Node{x, head};\n    head = s;\n}",
      options: [
        "A. head 成功指向新节点 10",
        "B. head 依然是 nullptr，且新申请的节点发生了内存泄漏",
        "C. 程序编译报错，不允许给形参 head 赋值",
        "D. 运行时触发空指针段错误崩溃"
      ],
      answer: 1,
      explanation: "参数 Node* head 是按值传递的指针副本。函数内修改 head = s 只改了局部副本，主函数的 head 纹丝不动，新 new 出来的节点也无人接收造成内存泄漏。应改为指针引用 Node*& head。",
      tag: "指针"
    },
    {
      id: "q-00-03",
      chapterId: "00",
      difficulty: 1,
      type: "single",
      prompt: "已知定义 struct LNode { int data; LNode* next; };，若 LNode node; 且 LNode* p = &node;，下面访问 data 成员的写法正确的是？",
      code: "",
      options: [
        "A. node->data 和 p.data",
        "B. node.data 和 p->data",
        "C. *node.data 和 *p->data",
        "D. node.data 和 *p.data"
      ],
      answer: 1,
      explanation: "口诀：结构体对象本身用点号（node.data），指向结构体的指针用箭头（p->data，等价于 (*p).data）。注意点号优先级高于 *，所以 *p.data 是错的。",
      tag: "结构体"
    },
    {
      id: "q-00-04",
      chapterId: "00",
      difficulty: 1,
      type: "single",
      prompt: "使用 int* arr = new int[100]; 动态申请数组后，正确的释放方式是？",
      code: "",
      options: [
        "A. delete arr;",
        "B. free(arr);",
        "C. delete[] arr; arr = nullptr;",
        "D. delete arr[100];"
      ],
      answer: 2,
      explanation: "C++ 中 new[] 必须严格配对 delete[]，混用 delete 或 free 属于未定义行为（UB）。释放后顺手置为 nullptr 可防止后续误用形成悬空指针。",
      tag: "动态内存"
    },
    {
      id: "q-00-05",
      chapterId: "00",
      difficulty: 2,
      type: "single",
      prompt: "下面函数 makeArr 返回数组指针的做法存在什么致命缺陷？",
      code: "int* makeArr() {\n    int a[5] = {1, 2, 3, 4, 5};\n    return a;\n}",
      options: [
        "A. 数组长度太短，无法返回",
        "B. 返回了局部栈数组的地址，函数退出后该内存即失效（悬空指针）",
        "C. 数组名 a 不能隐式转换为 int* 指针",
        "D. 没有使用 const 修饰返回值"
      ],
      answer: 1,
      explanation: "局部数组 a 存放在函数栈帧中，makeArr 返回后栈帧立即销毁。外部拿到的是指向“已拆迁内存”的悬空指针，读写会产生乱码或崩溃。需要跨函数存活的数组应使用 new int[5] 分配在堆区。",
      tag: "内存管理"
    },
    {
      id: "q-00-06",
      chapterId: "00",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：定义指针变量 int* p; 但未赋值时，直接执行 *p = 42; 属于解引用野指针，极易导致程序段错误（Segmentation Fault）崩溃。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！局部未初始化指针 p 中存的是随机垃圾地址，对其解引用 *p 会读写非法内存区域，操作系统会直接终止程序。定义指针时应顺手初始化为合法地址或 nullptr。",
      tag: "指针"
    },
    {
      id: "q-00-07",
      chapterId: "00",
      difficulty: 2,
      type: "single",
      prompt: "下面代码在释放链表时有什么问题？",
      code: "while (cur != nullptr) {\n    delete cur;\n    cur = cur->next;\n}",
      options: [
        "A. 没有释放最后一个节点",
        "B. 释放后继续访问已销毁内存（Use-After-Free），应先保存 nxt = cur->next 再 delete cur",
        "C. 应该用 delete[] cur 释放单个节点",
        "D. while 条件应写成 cur->next != nullptr"
      ],
      answer: 1,
      explanation: "先 delete cur 会把节点内存还给系统，紧接着读 cur->next 属于“先炸桥再过桥”的 Use-After-Free 未定义行为。必须先 Node* nxt = cur->next; 再 delete cur; 最后 cur = nxt;。",
      tag: "动态内存"
    },
    {
      id: "q-00-08",
      chapterId: "00",
      difficulty: 2,
      type: "single",
      prompt: "关于递归函数的两个必要条件，以下描述最准确的是？",
      code: "",
      options: [
        "A. 必须使用全局变量和 while 循环",
        "B. 必须有明确的递归出口（基准情形）+ 每次递归调用使问题规模向出口收敛",
        "C. 必须返回 int 类型且参数只能有一个",
        "D. 必须显式使用 std::stack 才能运行"
      ],
      answer: 1,
      explanation: "写好递归的两条铁律：① 必须有明确的递归出口（Base Case），否则无限递归导致栈溢出（Stack Overflow）；② 每次递归必须把问题拆解为更小的同类子问题，确保能走到出口。",
      tag: "递归"
    },
    {
      id: "q-00-09",
      chapterId: "00",
      difficulty: 2,
      type: "single",
      prompt: "在 C++ 类中，如果类成员包含动态申请的堆数组（如 int* data = new int[n]），若不自定义拷贝构造函数而直接使用默认拷贝，会发生什么风险？",
      code: "",
      options: [
        "A. 编译直接报错，无法生成对象",
        "B. 浅拷贝导致两个对象指向同一块堆内存，析构时发生二次释放（Double Free）崩溃",
        "C. 内存占用翻倍导致栈溢出",
        "D. 数组内所有元素自动清零"
      ],
      answer: 1,
      explanation: "编译器默认生成的拷贝构造是逐成员浅拷贝，仅复制指针地址。两个对象共享同一片堆数组，先后析构时会对其 delete[] 两次，引发 Double Free 崩溃。因此需要深拷贝（或禁用拷贝/使用 vector）。",
      tag: "类与对象"
    },
    {
      id: "q-00-10",
      chapterId: "00",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：在 C++11 及以上标准中，推荐使用 nullptr 而不是 0 或 NULL 表示空指针，因为 nullptr 有明确的指针类型，不会与整型重载产生歧义。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！在 C++ 中 NULL 往往是宏定义为整数 0，调用重载函数 f(int) 与 f(int*) 时可能产生歧义；nullptr 是真正的空指针字面量，安全清晰。",
      tag: "C++语法"
    },

    // ==================== 第 1 章：绪论 (10 题) ====================
    {
      id: "q-01-01",
      chapterId: "01",
      difficulty: 1,
      type: "single",
      prompt: "数据结构的“三要素”是指以下哪三项？",
      code: "",
      options: [
        "A. 输入、输出、有穷性",
        "B. 逻辑结构、存储结构（物理结构）、数据的运算",
        "C. 顺序存储、链式存储、索引存储",
        "D. 数据元素、数据项、数据对象"
      ],
      answer: 1,
      explanation: "教材第 1 章明确定义：数据结构包含三个方面——逻辑结构（数据间抽象关系）、存储结构（在计算机中的物理表示）和数据的运算（操作集合）。",
      tag: "基本概念"
    },
    {
      id: "q-01-02",
      chapterId: "01",
      difficulty: 1,
      type: "single",
      prompt: "以下结构中，哪一项属于“线性结构”？（教材习题 1）",
      code: "",
      options: [
        "A. 树",
        "B. 图",
        "C. 串（字符串）",
        "D. 集合"
      ],
      answer: 2,
      explanation: "串是由零个或多个字符组成的有限序列，元素之间是一对一的前驱/后继关系，属于线性结构。树（一对多）、图（多对多）、集合（无关系）均属于非线性结构。",
      tag: "逻辑结构"
    },
    {
      id: "q-01-03",
      chapterId: "01",
      difficulty: 1,
      type: "single",
      prompt: "【教材习题 1 高频陷阱！】分析下面 C++ 程序段的时间复杂度：",
      code: "for (i = 1; i <= n; i++)\n    k++;\n    for (j = 1; j <= n; j++)\n        m += k;",
      options: [
        "A. O(1)",
        "B. O(n)",
        "C. O(n log n)",
        "D. O(n²)"
      ],
      answer: 1,
      explanation: "超级陷阱！注意第一个 for 后面没有大括号 { }，在 C/C++ 中它只管辖紧随其后的一条语句 k++;！第二个 for 虽然视觉上缩进了，但在语法上与第一个 for 是顺序并列关系！总次数 T(n) = n + n = 2n = O(n)。",
      tag: "复杂度"
    },
    {
      id: "q-01-04",
      chapterId: "01",
      difficulty: 1,
      type: "single",
      prompt: "分析下面程序段的时间复杂度（教材习题 1）：",
      code: "int i = 1;\nwhile (i <= n)\n    i *= 2;",
      options: [
        "A. O(1)",
        "B. O(log₂n)",
        "C. O(√n)",
        "D. O(n)"
      ],
      answer: 1,
      explanation: "每次循环 i 翻倍，第 t 次循环后 i = 2^t。当 2^t > n 时退出，解得 t = ⌊log₂n⌋ + 1，故时间复杂度为 O(log₂n)。口诀：循环变量每次 ×2 或 ÷2，就是对数阶！",
      tag: "复杂度"
    },
    {
      id: "q-01-05",
      chapterId: "01",
      difficulty: 2,
      type: "single",
      prompt: "分析下面两层循环程序段的时间复杂度（教材习题 1）：",
      code: "for (int i = 0; i < 100; i++)\n    for (int j = 0; j < i; j++)\n        sum += j;",
      options: [
        "A. O(1)",
        "B. O(n)",
        "C. O(n²)",
        "D. O(100n)"
      ],
      answer: 0,
      explanation: "不要看见两层嵌套循环就条件反射选 O(n²)！这里外层上限是固定常数 100，内层上限是 i < 100，完全不依赖输入规模 n，总执行次数恒为 4950 次，属于常数阶 O(1)！",
      tag: "复杂度"
    },
    {
      id: "q-01-06",
      chapterId: "01",
      difficulty: 2,
      type: "single",
      prompt: "分析下面程序段的时间复杂度（教材习题 1）：",
      code: "int y = 0;\nwhile (y * y * y <= n)\n    y++;",
      options: [
        "A. O(log n)",
        "B. O(n^(1/3))",
        "C. O(√n)",
        "D. O(n³)"
      ],
      answer: 1,
      explanation: "y 每次加 1，当 y³ > n 时循环结束，因此执行次数约等于 ∛n = n^(1/3)，时间复杂度为 O(n^(1/3))。",
      tag: "复杂度"
    },
    {
      id: "q-01-07",
      chapterId: "01",
      difficulty: 2,
      type: "single",
      prompt: "关于 NP 问题，以下说法正确的是哪一项？（教材习题 1 易错题）",
      code: "",
      options: [
        "A. NP 问题就是“非多项式时间问题”，即非 P 问题",
        "B. NP 问题是指“非确定性多项式时间问题”，可在多项式时间内验证一个候选解",
        "C. NP 问题是 P 问题的真子集",
        "D. NP 问题与 P 问题完全不相交"
      ],
      answer: 1,
      explanation: "NP 全称 Non-deterministic Polynomial（非确定性多项式时间），指能在多项式时间内验证解是否正确的问题，而非 Non-Polynomial！事实上 P ⊆ NP。",
      tag: "算法概念"
    },
    {
      id: "q-01-08",
      chapterId: "01",
      difficulty: 1,
      type: "single",
      prompt: "将以下常见时间复杂度按增长速度从慢到快（即效率从高到低）排序，正确的是？",
      code: "",
      options: [
        "A. O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)",
        "B. O(1) < O(n) < O(log n) < O(n log n) < O(n²) < O(n!) < O(2ⁿ)",
        "C. O(1) < O(log n) < O(n log n) < O(n) < O(n²) < O(2ⁿ) < O(n!)",
        "D. O(log n) < O(1) < O(n) < O(n log n) < O(2ⁿ) < O(n²) < O(n!)"
      ],
      answer: 0,
      explanation: "必背增长率顺序：常 < 对 < 幂(线性) < 线性对数 < 平方 < 立方 < 指数 < 阶乘，即 O(1) < O(log n) < O(n) < O(n log n) < O(n²) < O(2ⁿ) < O(n!)。",
      tag: "复杂度"
    },
    {
      id: "q-01-09",
      chapterId: "01",
      difficulty: 2,
      type: "single",
      prompt: "在 C++ STL 中，以下哪一个不属于“顺序容器”？（教材习题 1）",
      code: "",
      options: [
        "A. vector（向量）",
        "B. list（双向链表）",
        "C. queue（队列）",
        "D. deque（双端队列）"
      ],
      answer: 2,
      explanation: "STL 顺序容器为 vector、list、deque（C++11 增 array、forward_list）；而 stack、queue、priority_queue 属于“容器适配器”，默认基于 deque 或 vector 封装而成。",
      tag: "STL"
    },
    {
      id: "q-01-10",
      chapterId: "01",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：算法必须具备 5 个特性——输入、输出、有穷性、确定性、可行性；其中“输入”可以有 0 个或多个，但“输出”至少要有 1 个。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！一个没有输入的算法依然可以产生结果（如打印九九乘法表），但一个没有任何输出的算法毫无意义，因此至少有 1 个输出。",
      tag: "算法概念"
    },

    // ==================== 第 2 章：线性表 (12 题) ====================
    {
      id: "q-02-01",
      chapterId: "02",
      difficulty: 1,
      type: "single",
      prompt: "顺序表和单链表在“按位序查找第 i 个元素 Get(i)”时的时间复杂度分别是？",
      code: "",
      options: [
        "A. O(1) 和 O(1)",
        "B. O(1) 和 O(n)",
        "C. O(n) 和 O(1)",
        "D. O(n) 和 O(n)"
      ],
      answer: 1,
      explanation: "顺序表底层是连续数组，通过地址公式 b + (i-1)*k 一步定位，属随机存取 O(1)；单链表必须从头顺着 next 指针逐个扫描，属顺序存取 O(n)。",
      tag: "顺序表vs链表"
    },
    {
      id: "q-02-02",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "长度为 n 的顺序表，在任意合法位置等概率“插入”和“删除”一个元素，平均需要移动元素的次数分别是？（教材习题 2）",
      code: "",
      options: [
        "A. n/2 和 n/2",
        "B. n/2 和 (n-1)/2",
        "C. (n-1)/2 和 n/2",
        "D. (n+1)/2 和 n/2"
      ],
      answer: 1,
      explanation: "插入共有 n+1 个合法位置（移动 0~n 次），均值 (0+1+...+n)/(n+1) = n/2；删除共有 n 个合法位置（移动 0~n-1 次），均值 (0+1+...+(n-1))/n = (n-1)/2。",
      tag: "顺序表"
    },
    {
      id: "q-02-03",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "在单链表中，已知指针 p 指向某节点，要在 p 之后插入新节点 s，正确的指针修改顺序是？",
      code: "",
      options: [
        "A. p->next = s; s->next = p->next;",
        "B. s->next = p->next; p->next = s;",
        "C. s->next = p; p->next = s;",
        "D. p = s->next; s->next = p;"
      ],
      answer: 1,
      explanation: "铁律口诀：“先接后，再断前”！必须先让 s->next = p->next 牵住后面的链，再改 p->next = s。如果写成 A，p->next 被覆盖成 s 后，s->next 指向自己，后半条链表彻底丢失！",
      tag: "链表"
    },
    {
      id: "q-02-04",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "在双向链表中，要在指针 p 所指节点“之前”插入新节点 s（假设 p 有前驱节点），正确的操作序列是？（教材习题 2）",
      code: "",
      options: [
        "A. p->left = s; s->right = p; p->left->right = s; s->left = p->left;",
        "B. s->right = p; s->left = p->left; p->left = s; p->left->right = s;",
        "C. s->right = p; s->left = p->left; p->left->right = s; p->left = s;",
        "D. p->right = s; p->right->left = s; s->left = p; s->right = p->right;"
      ],
      answer: 2,
      explanation: "双链表插入口诀：先连新节点 s 的左右两臂（s->right = p; s->left = p->left;），再借原 p->left 改前驱的右指针（p->left->right = s;），最后才改 p->left = s！A、B 提前覆盖了 p->left 导致找不到原前驱。",
      tag: "双链表"
    },
    {
      id: "q-02-05",
      chapterId: "02",
      difficulty: 1,
      type: "single",
      prompt: "关于“静态链表”的说法，正确的是？",
      code: "",
      options: [
        "A. 静态链表在运行中可以无限自动扩容，无需预先分配内存",
        "B. 静态链表用一维结构体数组模拟链表，用整型下标（游标 cursor）代替内存指针",
        "C. 静态链表支持 O(1) 随机存取第 i 个元素",
        "D. 静态链表不能实现插入和删除操作"
      ],
      answer: 1,
      explanation: "静态链表是为不支持指针的语言或固定内存池场景设计的：底层是结构体数组（data + cur），用数组下标充当指针。插入删除仍只需改游标（不搬移数据），但按位查找仍需顺着游标走 O(n)。",
      tag: "静态链表"
    },
    {
      id: "q-02-06",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "在 32 位系统（指针占 4 字节）下存储 int（4 字节）数据时，顺序表、单链表、双链表的存储密度分别是？（教材习题 2）",
      code: "",
      options: [
        "A. 100%、50%、33.3%",
        "B. 100%、33.3%、25%",
        "C. 50%、33.3%、25%",
        "D. 100%、50%、50%"
      ],
      answer: 0,
      explanation: "存储密度 = 数据域字节数 / 节点总字节数。32 位下：顺序表 4/4 = 100%，单链表 4/(4+4) = 50%，双链表 4/(4+4+4) ≈ 33.3%。（注：64 位系统指针占 8 字节，单链表约 33.3%）。",
      tag: "存储密度"
    },
    {
      id: "q-02-07",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "带头结点的单向循环链表，若只设一个尾指针 rear 而不设头指针，则“头结点”和“首元结点（第 1 个数据结点）”的位置分别是？（教材习题 2 易错）",
      code: "",
      options: [
        "A. rear 和 rear->next",
        "B. rear->next 和 rear->next->next",
        "C. rear->next->next 和 rear->next",
        "D. rear->next 和 rear"
      ],
      answer: 1,
      explanation: "尾指针 rear 指向尾结点；尾结点的 next 指向头结点，即 rear->next 是头结点；再往后走一步 rear->next->next 才是首元结点！设尾指针的好处是访问表头和表尾均为 O(1)。",
      tag: "循环链表"
    },
    {
      id: "q-02-08",
      chapterId: "02",
      difficulty: 1,
      type: "single",
      prompt: "在单链表中增加一个“头结点（Dummy Head）”的主要目的是？（教材习题 2）",
      code: "",
      options: [
        "A. 节省链表的内存空间",
        "B. 使单链表至少包含一个有效数据元素",
        "C. 统一空表/非空表及表头/表中的插删逻辑，方便运算实现",
        "D. 让链表支持随机存取"
      ],
      answer: 2,
      explanation: "引入不存有效数据的头结点后，无论是否为空表、无论在第 1 位还是中间位置插删，都不必单独分类修改外部头指针，代码简洁且不易出错。",
      tag: "链表"
    },
    {
      id: "q-02-09",
      chapterId: "02",
      difficulty: 1,
      type: "single",
      prompt: "顺序表每个元素占 k 字节，第 1 个元素 a₁ 的首地址为 b，则第 i 个元素 aᵢ 的存储地址为？",
      code: "",
      options: [
        "A. b + k * i",
        "B. b + k * (i - 1)",
        "C. b + k * (i + 1)",
        "D. b + i - 1"
      ],
      answer: 1,
      explanation: "第 i 个元素前面共有 i - 1 个元素，每个占 k 字节，因此地址为 b + k * (i - 1)。这也是顺序表能 O(1) 随机存取的根本原因。",
      tag: "顺序表"
    },
    {
      id: "q-02-10",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "判断一个单链表中是否存在“环”，最经典且空间复杂度为 O(1) 的算法是？",
      code: "",
      options: [
        "A. 把所有节点值相加看是否溢出",
        "B. 快慢双指针（Floyd 判圈）：slow 每次走 1 步，fast 每次走 2 步，若相遇则有环",
        "C. 将链表反转后再顺序遍历",
        "D. 用数组存下所有节点地址再两两比较"
      ],
      answer: 1,
      explanation: "快慢指针法仅需 O(1) 额外空间：若无环，fast 会率先到达 nullptr；若有环，fast 进入环后每步拉近与 slow 的距离 1 格，必然在环内追上 slow！",
      tag: "链表算法"
    },
    {
      id: "q-02-11",
      chapterId: "02",
      difficulty: 2,
      type: "single",
      prompt: "原地反转单链表（时间 O(n)，额外空间 O(1)）时，三指针 prev、curr、next 在循环中的正确更新顺序是？",
      code: "",
      options: [
        "A. curr->next = prev; next = curr->next; prev = curr; curr = next;",
        "B. next = curr->next; curr->next = prev; prev = curr; curr = next;",
        "C. prev = curr; curr = curr->next; curr->next = prev;",
        "D. next = prev; prev = curr; curr->next = next;"
      ],
      answer: 1,
      explanation: "先用 next = curr->next 备份后继，防止掉头后断链；再把 curr->next 反转指向 prev；最后 prev 和 curr 整体向右平移一步！",
      tag: "链表算法"
    },
    {
      id: "q-02-12",
      chapterId: "02",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：对单向循环链表而言，从表中任意一个节点出发，都可以通过“向前或向后”操作扫描整个链表。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 1,
      explanation: "错误！（教材习题 2 经典坑）单向循环链表每个节点只有后继指针 next，只能“向后”绕圈扫描全部节点，不能直接向前移动；只有双向循环链表才能双向扫描。",
      tag: "循环链表"
    },

    // ==================== 第 3 章：线性表的扩展 (12 题) ====================
    {
      id: "q-03-01",
      chapterId: "03",
      difficulty: 1,
      type: "single",
      prompt: "元素 1, 2, 3, 4 按顺序依次入栈（允许中途随时出栈），以下哪一个“不可能”是合法的出栈序列？",
      code: "",
      options: [
        "A. 1, 2, 3, 4",
        "B. 4, 3, 2, 1",
        "C. 2, 4, 3, 1",
        "D. 3, 1, 4, 2"
      ],
      answer: 3,
      explanation: "若 3 第一个出栈，说明 1、2 已在栈中且 2 在 1 上方，2 必然比 1 先出栈！选项 D 中 3 之后紧跟着 1，跳过了栈顶的 2，绝对不可能。",
      tag: "栈"
    },
    {
      id: "q-03-02",
      chapterId: "03",
      difficulty: 1,
      type: "single",
      prompt: "采用“少用一个存储单元”策略的循环队列（数组长度为 maxSize），队空和队满的条件分别是？",
      code: "",
      options: [
        "A. front == rear 和 rear == maxSize - 1",
        "B. front == rear 和 (rear + 1) % maxSize == front",
        "C. front == 0 和 rear == maxSize",
        "D. (rear + 1) % maxSize == front 和 front == rear"
      ],
      answer: 1,
      explanation: "循环队列最常考结论：队空 front == rear；为了与队空区分，牺牲一个格子，当 rear 再走一步就追上 front 即 (rear + 1) % maxSize == front 时判满，最多存放 maxSize - 1 个元素。",
      tag: "循环队列"
    },
    {
      id: "q-03-03",
      chapterId: "03",
      difficulty: 2,
      type: "single",
      prompt: "数组长度为 maxSize = 8 的循环队列，当前 front = 6, rear = 2，此时队列中共有多少个元素？",
      code: "",
      options: [
        "A. 3 个",
        "B. 4 个",
        "C. 5 个",
        "D. 6 个"
      ],
      answer: 1,
      explanation: "套用循环队列元素个数必背公式：(rear - front + maxSize) % maxSize = (2 - 6 + 8) % 8 = 4 个（分别存在下标 6, 7, 0, 1）。",
      tag: "循环队列"
    },
    {
      id: "q-03-04",
      chapterId: "03",
      difficulty: 2,
      type: "single",
      prompt: "KMP 字符串匹配算法相比朴素暴力（BF）算法，最核心的时间优势来源是？",
      code: "",
      options: [
        "A. 使用了哈希表存储所有子串",
        "B. 失配时主串指针 i 永不回溯，只利用 next 数组让模式串指针 j 跳到最长相等真前后缀处",
        "C. 每次从主串末尾反向比较",
        "D. 将模式串先按字典序排序"
      ],
      answer: 1,
      explanation: "BF 算法一失配就把主串指针 i 退回重来，最坏 O(n×m)；KMP 提前算出模式串的 next 数组，失配时 i 原地不动、仅回退 j，将总时间复杂度降至 O(n + m)！",
      tag: "KMP"
    },
    {
      id: "q-03-05",
      chapterId: "03",
      difficulty: 3,
      type: "single",
      prompt: "按教材 1-based 定义（next[1]=0，next[j] = 前 j-1 个字符的最长相等真前后缀长度 + 1），模式串 \"abab\" 的 next[1..4] 是？",
      code: "",
      options: [
        "A. 0, 1, 1, 2",
        "B. 0, 1, 2, 3",
        "C. 0, 0, 1, 2",
        "D. 1, 1, 2, 3"
      ],
      answer: 0,
      explanation: "逐位推导：j=1 固定为 0；j=2 前缀 \"a\" 无真前后缀 → 0+1=1；j=3 前缀 \"ab\" 最长相等真前后缀 0 → 0+1=1；j=4 前缀 \"aba\" 最长相等真前后缀 \"a\" 长 1 → 1+1=2。故为 0, 1, 1, 2。",
      tag: "KMP"
    },
    {
      id: "q-03-06",
      chapterId: "03",
      difficulty: 3,
      type: "single",
      prompt: "按 0-based 前缀函数定义（next[i] 表示子串 s[0..i] 的最长相等真前后缀长度），模式串 \"ababaca\" 的 next 数组是？",
      code: "",
      options: [
        "A. [0, 0, 1, 2, 3, 0, 1]",
        "B. [0, 1, 1, 2, 3, 0, 1]",
        "C. [0, 0, 1, 2, 2, 0, 1]",
        "D. [0, 0, 1, 2, 3, 1, 1]"
      ],
      answer: 0,
      explanation: "逐位验证：a(0), ab(0), aba(\"a\"->1), abab(\"ab\"->2), ababa(\"aba\"->3), ababac(0), ababaca(\"a\"->1)。当到 'c' 失配时需通过 while 回退两次（3→1→0），正是测试 KMP while 回退的经典串！",
      tag: "KMP"
    },
    {
      id: "q-03-07",
      chapterId: "03",
      difficulty: 2,
      type: "single",
      prompt: "二维数组 int A[5][6] 按“行优先”存储，每个 int 占 4 字节，若 A[0][0] 的地址为 1000，则 A[3][4] 的地址为？",
      code: "",
      options: [
        "A. 1076",
        "B. 1088",
        "C. 1092",
        "D. 1100"
      ],
      answer: 1,
      explanation: "行优先地址公式：基址 + (i × 列数 + j) × 元素大小 = 1000 + (3 × 6 + 4) × 4 = 1000 + 22 × 4 = 1088。",
      tag: "数组"
    },
    {
      id: "q-03-08",
      chapterId: "03",
      difficulty: 2,
      type: "single",
      prompt: "将 n 阶对称矩阵的下三角（含主对角线）压缩存储到一维数组中，一共只需要存储多少个元素？",
      code: "",
      options: [
        "A. n²",
        "B. n(n - 1) / 2",
        "C. n(n + 1) / 2",
        "D. 2n - 1"
      ],
      answer: 2,
      explanation: "第 1 行存 1 个，第 2 行存 2 个，…，第 n 行存 n 个，总计 1 + 2 + ... + n = n(n + 1) / 2 个元素，节省了将近一半空间。",
      tag: "特殊矩阵"
    },
    {
      id: "q-03-09",
      chapterId: "03",
      difficulty: 1,
      type: "single",
      prompt: "稀疏矩阵（绝大部分元素为 0）最常用的顺序压缩存储表示是？",
      code: "",
      options: [
        "A. 邻接矩阵",
        "B. 三元组表（行号 row、列号 col、非零值 val）",
        "C. 顺序栈",
        "D. 哈夫曼树"
      ],
      answer: 1,
      explanation: "稀疏矩阵只存非零元素的 (row, col, val) 三元组，外加总行数、总列数、非零元个数即可完整还原矩阵（若需频繁动态修改非零元结构，可用十字链表）。",
      tag: "稀疏矩阵"
    },
    {
      id: "q-03-10",
      chapterId: "03",
      difficulty: 1,
      type: "single",
      prompt: "下列哪一组场景最典型地分别对应“栈（Stack）”和“队列（Queue）”的应用？",
      code: "",
      options: [
        "A. 栈：BFS 层序遍历；队列：函数递归调用",
        "B. 栈：括号匹配与表达式求值；队列：BFS 广度优先遍历与任务缓冲",
        "C. 栈：打印任务排队；队列：撤销操作（Ctrl+Z）",
        "D. 栈：磁盘调度；队列：深度优先遍历 DFS"
      ],
      answer: 1,
      explanation: "栈是后进先出（LIFO），适合括号匹配、表达式求值、递归调用栈、撤销操作；队列是先进先出（FIFO），适合 BFS、层序遍历、消息队列与排队缓冲。",
      tag: "栈与队列"
    },
    {
      id: "q-03-11",
      chapterId: "03",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：空串 \"\" 与仅包含一个空格的空格串 \" \" 是完全等价的，长度都为 0。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 1,
      explanation: "错误！空串不含任何字符，长度为 0；空格本身是一个合法的 ASCII 字符（码值 32），空格串 \" \" 的长度为 1，不是空串。",
      tag: "串"
    },
    {
      id: "q-03-12",
      chapterId: "03",
      difficulty: 2,
      type: "single",
      prompt: "使用链式存储实现队列（链队列）时，为了保证入队和出队操作都是 O(1)，通常如何设计指针？",
      code: "",
      options: [
        "A. 只设一个头指针 front 即可",
        "B. 只设一个尾指针 rear 即可（非循环链表）",
        "C. 同时设队头指针 front（用于出队）和队尾指针 rear（用于入队）",
        "D. 在表头入队、在表尾出队"
      ],
      answer: 2,
      explanation: "单链表在表头删除（出队）是 O(1)，但在表尾删除找前驱需要 O(n)；而在表尾插入（入队）只要有尾指针 rear 就是 O(1)。因此链队列设 front 出队、rear 入队，双向均为 O(1)！",
      tag: "队列"
    },

    // ==================== 第 4 章：树与二叉树 (12 题) ====================
    {
      id: "q-04-01",
      chapterId: "04",
      difficulty: 1,
      type: "single",
      prompt: "【二叉树性质 3 必考】一棵非空二叉树中，度为 2 的节点有 15 个，度为 1 的节点有 8 个，则该二叉树的叶子节点（度为 0）共有多少个？",
      code: "",
      options: [
        "A. 15 个",
        "B. 16 个",
        "C. 23 个",
        "D. 24 个"
      ],
      answer: 1,
      explanation: "二叉树性质 3：对任何非空二叉树，n₀ = n₂ + 1！与度为 1 的节点个数 n₁ 完全无关！因此叶子节点数 n₀ = 15 + 1 = 16 个。",
      tag: "二叉树性质"
    },
    {
      id: "q-04-02",
      chapterId: "04",
      difficulty: 1,
      type: "single",
      prompt: "深度为 h（根节点在第 1 层）的二叉树，第 i 层最多有多少个节点？整棵树最多有多少个节点？",
      code: "",
      options: [
        "A. 2^i 和 2^h",
        "B. 2^(i-1) 和 2^h - 1",
        "C. 2^(i-1) 和 2^(h-1)",
        "D. 2i 和 2h - 1"
      ],
      answer: 1,
      explanation: "二叉树性质 1：第 i 层最多 2^(i-1) 个节点；性质 2：深度为 h 的二叉树最多有 1 + 2 + 4 + ... + 2^(h-1) = 2^h - 1 个节点（即满二叉树）。",
      tag: "二叉树性质"
    },
    {
      id: "q-04-03",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "一棵具有 100 个节点的完全二叉树，其深度（高度）是多少？若按层序从 1 开始编号，编号为 25 的节点的双亲和左孩子编号分别是？",
      code: "",
      options: [
        "A. 深度 7；双亲 12，左孩子 50",
        "B. 深度 6；双亲 12，左孩子 50",
        "C. 深度 7；双亲 13，左孩子 51",
        "D. 深度 8；双亲 12，左孩子 49"
      ],
      answer: 0,
      explanation: "性质 4：深度 = ⌊log₂100⌋ + 1 = 6 + 1 = 7；性质 5：编号 i=25 的双亲 = ⌊25/2⌋ = 12，左孩子 = 2×25 = 50（≤100，存在）。",
      tag: "完全二叉树"
    },
    {
      id: "q-04-04",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "【必考还原题】已知一棵二叉树的前序遍历为 ABDECF，中序遍历为 DBEAFC，则其后序遍历序列为？",
      code: "",
      options: [
        "A. DEBFCA",
        "B. DBEFCA",
        "C. DEFBCA",
        "D. DBEF AC"
      ],
      answer: 0,
      explanation: "前序首字母 A 是根 → 中序中 A 左边 DBE 是左子树、右边 FC 是右子树。左子树前序 BDE、中序 DBE → B 为根，左 D 右 E，后序 DEB；右子树前序 CF、中序 FC → C 为根，左 F，后序 FC。合并后序（左右根）得：DEBFCA！",
      tag: "遍历还原"
    },
    {
      id: "q-04-05",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "以下哪组遍历序列“无法”唯一确定一棵二叉树？",
      code: "",
      options: [
        "A. 前序遍历 + 中序遍历",
        "B. 后序遍历 + 中序遍历",
        "C. 层序遍历 + 中序遍历",
        "D. 前序遍历 + 后序遍历"
      ],
      answer: 3,
      explanation: "没有中序遍历就无法区分单孩子节点到底是左孩子还是右孩子！例如两棵树：根 A 只有左孩 B，与根 A 只有右孩 B，前序都是 AB、后序都是 BA，但树形不同。因此前序+后序不能唯一确定二叉树。",
      tag: "遍历还原"
    },
    {
      id: "q-04-06",
      chapterId: "04",
      difficulty: 1,
      type: "single",
      prompt: "释放整棵二叉树的动态内存（delete 所有节点）时，必须采用哪种遍历顺序？",
      code: "",
      options: [
        "A. 前序遍历（根左右）",
        "B. 中序遍历（左根右）",
        "C. 后序遍历（左右根）",
        "D. 任意顺序都可以"
      ],
      answer: 2,
      explanation: "必须用后序遍历（左右根）！先彻底释放左子树、再释放右子树，最后 delete root。如果用前序先 delete root，再去访问 root->left 和 root->right 就会触发 Use-After-Free 崩溃！",
      tag: "二叉树遍历"
    },
    {
      id: "q-04-07",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "给定权值集合 {2, 3, 4, 7} 构造一棵哈夫曼树，其最小带权路径长度（WPL）是多少？",
      code: "",
      options: [
        "A. 25",
        "B. 30",
        "C. 32",
        "D. 35"
      ],
      answer: 1,
      explanation: "每次合并最小两权值：① 2+3=5（剩 {4,5,7}）；② 4+5=9（剩 {7,9}）；③ 7+9=16。速算技巧：WPL = 所有非叶节点权值之和 = 5 + 9 + 16 = 30！（验算：2×3 + 3×3 + 4×2 + 7×1 = 6+9+8+7 = 30）。",
      tag: "哈夫曼树"
    },
    {
      id: "q-04-08",
      chapterId: "04",
      difficulty: 1,
      type: "single",
      prompt: "由 n 个带权叶子节点构造的哈夫曼树，总共有多少个节点？其中度为 1 的节点有多少个？",
      code: "",
      options: [
        "A. 2n 个节点，度为 1 的节点有 1 个",
        "B. 2n - 1 个节点，度为 1 的节点有 0 个",
        "C. 2n + 1 个节点，度为 1 的节点有 0 个",
        "D. n² 个节点，度为 1 的节点不确定"
      ],
      answer: 1,
      explanation: "哈夫曼树每次把 2 棵树合并生成 1 个新父节点（度为 2），绝不会产生度为 1 的节点（n₁ = 0）。由 n₂ = n₀ - 1 = n - 1，总节点数 = n₀ + n₂ = 2n - 1。",
      tag: "哈夫曼树"
    },
    {
      id: "q-04-09",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "哈夫曼编码能做到无损压缩且解码无二义性，是因为它是一种“前缀编码”，这意味着？",
      code: "",
      options: [
        "A. 所有字符的编码长度完全相同",
        "B. 任意一个字符的编码都不是另一个字符编码的前缀（所有字符都在叶子上）",
        "C. 编码只能由 0 组成",
        "D. 权值越小的字符编码越短"
      ],
      answer: 1,
      explanation: "所有待编码字符全部位于哈夫曼树的叶子节点上，从根到叶子的路径不可能是另一个叶子路径的前缀，因此解码时逐位匹配即可唯一还原；且权值越大离根越近、编码越短，实现高压缩率。",
      tag: "哈夫曼编码"
    },
    {
      id: "q-04-10",
      chapterId: "04",
      difficulty: 2,
      type: "single",
      prompt: "将一棵普通树转换为二叉树时，采用“孩子兄弟表示法”的核心规则是？",
      code: "",
      options: [
        "A. 左指针指向父节点，右指针指向孩子",
        "B. 左指针指向第一个孩子（长子），右指针指向下一个右兄弟",
        "C. 左指针指向最右孩子，右指针指向最左兄弟",
        "D. 随机分配左右指针"
      ],
      answer: 1,
      explanation: "口诀：“左孩右兄”！每个节点的 left 指向它的第一个孩子，right 指向它在原树中的下一个相邻兄弟。由此转出的二叉树根节点一定没有右子树（因为一棵树的根没有兄弟）。",
      tag: "树转二叉树"
    },
    {
      id: "q-04-11",
      chapterId: "04",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：二叉树就是“度为 2 的有序树”，两者概念完全相同。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 1,
      explanation: "错误！三大区别：① 二叉树可以是空树，而度为 2 的树至少有 3 个节点；② 二叉树严格区分左子树和右子树（即使只有一个孩子也要标明是左还是右），普通树只有一个孩子时不分左右。",
      tag: "树的概念"
    },
    {
      id: "q-04-12",
      chapterId: "04",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：满二叉树一定是完全二叉树，但完全二叉树不一定是满二叉树。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！满二叉树每层节点数都达到上限，自然满足完全二叉树“仅最后一层可不满且节点靠左排列”的要求；反之则不一定。",
      tag: "完全二叉树"
    }
  ];

  // 后续章节在下方追加拼接
  global.__DS_Q_PART1 = questions;
})(typeof window !== "undefined" ? window : globalThis);

(function (global) {
  "use strict";

  var questionsPart2 = [
    // ==================== 第 5 章：图 (12 题) ====================
    {
      id: "q-05-01",
      chapterId: "05",
      difficulty: 1,
      type: "single",
      prompt: "具有 n 个顶点的“无向完全图”和“有向完全图”分别有多少条边（弧）？",
      code: "",
      options: [
        "A. n(n-1) 和 n(n-1)/2",
        "B. n(n-1)/2 和 n(n-1)",
        "C. n² 和 2n²",
        "D. n-1 和 2(n-1)"
      ],
      answer: 1,
      explanation: "无向完全图任意两点间有 1 条边，共 C(n,2) = n(n-1)/2 条；有向完全图任意两点间有互逆的 2 条有向弧，共 n(n-1) 条。",
      tag: "图的基本概念"
    },
    {
      id: "q-05-02",
      chapterId: "05",
      difficulty: 1,
      type: "single",
      prompt: "【握手定理】一个无向图有 7 个顶点，各顶点的度数之和为 24，则该图共有多少条边？",
      code: "",
      options: [
        "A. 7 条",
        "B. 12 条",
        "C. 24 条",
        "D. 48 条"
      ],
      answer: 1,
      explanation: "每条无向边连接 2 个顶点，为两个端点各贡献 1 度，因此所有顶点度数之和 = 2 × 边数 e。故 e = 24 / 2 = 12 条。",
      tag: "图的基本概念"
    },
    {
      id: "q-05-03",
      chapterId: "05",
      difficulty: 1,
      type: "single",
      prompt: "关于图的“邻接矩阵”和“邻接表”存储，下列说法正确的是？",
      code: "",
      options: [
        "A. 邻接矩阵空间复杂度 O(n²)，适合稀疏图；邻接表空间 O(n+e)，适合稠密图",
        "B. 邻接矩阵空间复杂度 O(n²)，判断两点是否相邻只需 O(1)，适合稠密图；邻接表空间 O(n+e)，适合稀疏图",
        "C. 邻接表判断任意两顶点 u、v 是否相邻只需 O(1)",
        "D. 无向图的邻接矩阵一定不是对称矩阵"
      ],
      answer: 1,
      explanation: "邻接矩阵查边直接看 g[u][v] 仅需 O(1)，但占 O(n²) 空间，适合稠密图（无向图邻接矩阵必对称）；邻接表只存实际存在的边，空间 O(n+e)，适合稀疏图，但查边需遍历邻接链表 O(度)。",
      tag: "图的存储"
    },
    {
      id: "q-05-04",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "在有向图的邻接矩阵 A 中，第 i 行中非零元素的个数和第 i 列中非零元素的个数分别表示顶点 i 的？",
      code: "",
      options: [
        "A. 入度 和 出度",
        "B. 出度 和 入度",
        "C. 都是总度数",
        "D. 连通分量个数"
      ],
      answer: 1,
      explanation: "A[i][j] = 1 表示有一条从 i 出发指向 j 的有向边 (i→j)。因此第 i 行之和是顶点 i 的出度，第 i 列之和是顶点 i 的入度！口诀：行出列入。",
      tag: "图的存储"
    },
    {
      id: "q-05-05",
      chapterId: "05",
      difficulty: 1,
      type: "single",
      prompt: "图的深度优先搜索（DFS）和广度优先搜索（BFS）分别依赖什么核心数据结构？其中哪一个能求“无权图”的单源最短路径？",
      code: "",
      options: [
        "A. DFS 用队列、BFS 用栈；DFS 可求无权图最短路",
        "B. DFS 用栈（递归栈）、BFS 用队列；BFS 可求无权图最短路",
        "C. 两者都用栈；都能求无权图最短路",
        "D. 两者都用堆；都不能求最短路"
      ],
      answer: 1,
      explanation: "DFS 借助系统递归栈/显式栈“一条路走到底”；BFS 借助队列“按层波纹扩散”，第一次到达目标点时的层数必为最少边数，故 BFS 可求无权图单源最短路径！",
      tag: "图遍历"
    },
    {
      id: "q-05-06",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "对于一个非连通无向图，若要遍历其全部顶点，需要在外层循环中对每个未访问顶点启动一次 DFS/BFS。外层共调用了几次 DFS/BFS，恰好等于该图的？",
      code: "",
      options: [
        "A. 顶点数 n",
        "B. 边数 e",
        "C. 连通分量个数",
        "D. 环的个数"
      ],
      answer: 2,
      explanation: "每次从某个未访问顶点启动 DFS/BFS，都会恰好把该顶点所在的整个极大连通子图（一个连通分量）访问完毕。因此总共启动了多少次，就说明图中有多少个连通分量！",
      tag: "图遍历"
    },
    {
      id: "q-05-07",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "关于最小生成树（MST）的两大经典算法 Prim 和 Kruskal，以下对比正确的是？",
      code: "",
      options: [
        "A. Prim 按边贪心（O(e log e)）适合稀疏图；Kruskal 按点贪心（O(n²)）适合稠密图",
        "B. Prim 从点出发加点（朴素 O(n²)）适合稠密图；Kruskal 从边出发加边+并查集判环（O(e log e)）适合稀疏图",
        "C. 两者求出的最小生成树形态一定完全唯一",
        "D. 最小生成树共有 n 条边"
      ],
      answer: 1,
      explanation: "n 个顶点的连通图其生成树恰有 n-1 条边；若存在相等权值边，MST 形态可能不唯一但总权值唯一最小。Prim 朴素版 O(n²) 与边数无关，适合稠密图；Kruskal 排序边+并查集判环 O(e log e)，适合稀疏图。",
      tag: "最小生成树"
    },
    {
      id: "q-05-08",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "为什么 Dijkstra 算法不能用于包含“负权边”的图求单源最短路径？",
      code: "",
      options: [
        "A. 数组不能存放负数",
        "B. Dijkstra 基于贪心假设：每次选出当前 dist 最小的点 u 即永久锁定其最短路，但负权边可能让后续绕路变得更短，打破贪心前提",
        "C. 负权边会导致邻接矩阵变成非方阵",
        "D. Dijkstra 只能处理无向图"
      ],
      answer: 1,
      explanation: "Dijkstra 一旦将当前最小 dist[u] 标记为已确定（visited[u]=true），以后再也不会更新它。若有负权边，可能从更远的点经负权边绕回 u 得到更小距离，从而导致结果错误。",
      tag: "最短路径"
    },
    {
      id: "q-05-09",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "关于 Floyd 多源最短路径算法的三重循环，以下说法正确的是？",
      code: "for (int k = 0; k < n; k++)\n  for (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++)\n      if (d[i][k] + d[k][j] < d[i][j])\n        d[i][j] = d[i][k] + d[k][j];",
      options: [
        "A. 中转点 k 的循环可以随便放到最内层，结果完全不变",
        "B. 中转点 k 的循环必须在最外层，时间复杂度 O(n³)，可处理负权边（无负权环）",
        "C. Floyd 的时间复杂度是 O(n²)",
        "D. Floyd 只能求从顶点 0 出发的单源最短路"
      ],
      answer: 1,
      explanation: "Floyd 本质是动态规划：阶段状态是“只允许经过前 k 个点作为中转”，因此 k 必须放在最外层！时间复杂度 O(n³)，空间 O(n²)，可求任意两点间最短路且允许负权边（不能有负权环）。",
      tag: "最短路径"
    },
    {
      id: "q-05-10",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "对一个有向图执行“拓扑排序（Kahn 算法：不断取出入度为 0 的顶点并删去其出边）”时，如果最终输出的顶点数小于总顶点数 n，说明了什么？",
      code: "",
      options: [
        "A. 该图是非连通图",
        "B. 该有向图中存在“有向环”（不是 DAG），工程任务存在循环依赖",
        "C. 存在孤立顶点",
        "D. 算法队列开得太小"
      ],
      answer: 1,
      explanation: "拓扑排序既能给 AOV 网安排合法施工先后顺序，也是判断有向图是否有环的利器：环上的每个顶点入度永远 ≥ 1，永远无法入队，因此最终输出数 < n 必说明存在有向环！",
      tag: "拓扑排序"
    },
    {
      id: "q-05-11",
      chapterId: "05",
      difficulty: 2,
      type: "single",
      prompt: "在表示工程进度的 AOE 网（边表示活动、边权表示工期）中，“关键路径”是指？",
      code: "",
      options: [
        "A. 从源点到汇点边数最少的路径",
        "B. 从源点到汇点权值之和最短的路径",
        "C. 从源点到汇点带权路径长度最长的路径，决定了整个工程的最短完工总工期",
        "D. 经过顶点最多的无权路径"
      ],
      answer: 2,
      explanation: "工程必须等所有并行分支全部做完才能竣工，所以耗费时间最长的那条路径（关键路径）决定了整个工程的最短完工时间！关键路径上的活动时间余量为 0（最早开始 = 最迟开始），一旦延期就会拖慢全工程。",
      tag: "关键路径"
    },
    {
      id: "q-05-12",
      chapterId: "05",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：图的遍历与树的遍历最大的不同在于图可能存在“环”，因此必须维护 visited[] 标记数组，否则会陷入无限死循环。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！树是无环连通图，父到子一路向下绝不回头；而图中可能存在回路，若不记录 visited[]，DFS/BFS 会在环里永无止境地绕圈。",
      tag: "图遍历"
    },

    // ==================== 第 6 章：查找 (12 题) ====================
    {
      id: "q-06-01",
      chapterId: "06",
      difficulty: 1,
      type: "single",
      prompt: "使用“折半查找（二分查找）”必须同时满足哪两个前提条件？",
      code: "",
      options: [
        "A. 数据无序 + 顺序存储",
        "B. 关键字有序 + 顺序存储（支持 O(1) 随机访问中间元素）",
        "C. 关键字有序 + 单链表存储",
        "D. 元素必须全部为正整数"
      ],
      answer: 1,
      explanation: "折半查找既要求表内元素按关键字有序，又要求采用顺序存储（数组），这样才能 O(1) 跳到 mid。链表虽然可以有序，但找中点要 O(n)，无法享受 O(log n) 折半查找！",
      tag: "折半查找"
    },
    {
      id: "q-06-02",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "长度为 n 的顺序表，等概率查找成功时“顺序查找”的平均查找长度 ASL 是多少？而在 1000 个有序元素上做折半查找，最多需要比较多少次？",
      code: "",
      options: [
        "A. (n+1)/2；最多 10 次",
        "B. n/2；最多 100 次",
        "C. (n+1)/2；最多 9 次",
        "D. n；最多 10 次"
      ],
      answer: 0,
      explanation: "顺序查找成功 ASL = (1+2+...+n)/n = (n+1)/2；折半查找判定树高度 = ⌊log₂1000⌋ + 1 = 9 + 1 = 10，因此最多只需比较 10 次即可锁定目标或确认不存在！",
      tag: "ASL与折半"
    },
    {
      id: "q-06-03",
      chapterId: "06",
      difficulty: 1,
      type: "single",
      prompt: "写折半查找时，为什么工程与教材都推荐写 int mid = low + (high - low) / 2; 而不是 (low + high) / 2？",
      code: "",
      options: [
        "A. 算出来的结果比 (low + high) / 2 大 1",
        "B. 当 low 和 high 都很大时，low + high 可能超出 int 上限发生整数溢出变成负数",
        "C. C++ 不支持括号里做加法",
        "D. 可以把时间复杂度从 O(log n) 降到 O(1)"
      ],
      answer: 1,
      explanation: "当数组很大且 low、high 都接近 INT_MAX/2 时，low + high 会整型溢出为负数，导致数组负下标崩溃；写成 low + (high - low) / 2 在数学上完全等价且永不溢出！",
      tag: "折半查找"
    },
    {
      id: "q-06-04",
      chapterId: "06",
      difficulty: 1,
      type: "single",
      prompt: "对一棵合法的二叉排序树（BST）进行哪种遍历，一定能得到一个严格递增（升序）的关键字序列？",
      code: "",
      options: [
        "A. 前序遍历",
        "B. 中序遍历",
        "C. 后序遍历",
        "D. 层序遍历"
      ],
      answer: 1,
      explanation: "BST 满足“左子树所有节点 < 根 < 右子树所有节点”，因此按“左→根→右”的中序遍历必然输出有序递增序列！这也是检验手写 BST 是否正确的黄金手段。",
      tag: "BST"
    },
    {
      id: "q-06-05",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "向一棵空的二叉排序树（BST）中依次插入已经排好序的数据 1, 2, 3, ..., n，此时这棵 BST 的形态和查找时间复杂度分别是？",
      code: "",
      options: [
        "A. 完美平衡二叉树，O(log n)",
        "B. 退化为一条单边斜树（等价于单链表），查找退化为 O(n)",
        "C. 完全二叉树，O(log n)",
        "D. 满二叉树，O(1)"
      ],
      answer: 1,
      explanation: "插入严格有序序列会让每个新节点都一路挂在最右边，树高变成 n，彻底退化为单链表，查找性能暴跌至 O(n)！解决之道正是引入自平衡树（如 AVL 树或红黑树）。",
      tag: "BST"
    },
    {
      id: "q-06-06",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "在 BST 中删除一个“同时拥有左孩子和右孩子”的节点 p 时，经典做法是用哪一个节点的值替换 p，再删掉那个替身节点？",
      code: "",
      options: [
        "A. 整棵树的根节点",
        "B. p 的中序后继（右子树中最小的节点）或中序前驱（左子树中最大的节点）",
        "C. 任意一个叶子节点",
        "D. 直接把 p 的右子树整棵丢弃"
      ],
      answer: 1,
      explanation: "用 p 的中序后继（右子树最左下节点，至多有右孩子）或中序前驱（左子树最右下节点，至多有左孩子）替换 p 的值，既保持了全树 BST 有序性质，又把双孩子删除优雅地化归为“删叶子或删单孩子”！",
      tag: "BST"
    },
    {
      id: "q-06-07",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "在平衡二叉树（AVL 树）中，当在某失衡节点的“左孩子的右子树”中插入新节点引发 LR 型失衡时，需要执行哪种旋转调整？",
      code: "",
      options: [
        "A. 单次右旋",
        "B. 单次左旋",
        "C. 先对左孩子左旋，再对失衡节点右旋（先左后右双旋）",
        "D. 先对右孩子右旋，再对失衡节点左旋（先右后左双旋）"
      ],
      answer: 2,
      explanation: "AVL 旋转速记口诀：直线型（LL 右旋、RR 左旋）转一次；折线型（LR 先左后右、RL 先右后左）转两次！LR 型先把左子树拉直成 LL，再整体右旋。",
      tag: "AVL树"
    },
    {
      id: "q-06-08",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "为什么现代关系型数据库（如 MySQL）的磁盘索引优先采用 B+ 树，而不是普通二叉树或 B- 树？以下说法最全面的是？",
      code: "",
      options: [
        "A. B+ 树高度极低（多路分支，大幅减少磁盘 I/O）+ 内部节点只存索引不存数据（单页扇出更大）+ 叶子节点用双向链表串联（极度擅长范围查询）",
        "B. B+ 树在内存中比数组下标访问更快",
        "C. B+ 树每个节点只能存 1 个关键字，实现非常简单",
        "D. B+ 树不需要磁盘存储"
      ],
      answer: 0,
      explanation: "三大王牌优势：① 多路矮胖（百万级数据仅 3~4 层，只需 3~4 次磁盘 I/O）；② 非叶节点不存整行数据，一页（16KB）能塞下上千个索引键，树更矮；③ 所有数据都在叶子且用链表相连，BETWEEN / ORDER BY 范围扫描飞快！",
      tag: "B+树"
    },
    {
      id: "q-06-09",
      chapterId: "06",
      difficulty: 3,
      type: "single",
      prompt: "【数据库工程高频考】关于 MySQL 中 InnoDB 与 MyISAM 存储引擎的 B+ 树索引区别，下列说法正确的是？",
      code: "",
      options: [
        "A. MyISAM 主键索引叶子节点存整行数据，InnoDB 只存磁盘地址指针",
        "B. InnoDB 主键索引是“聚集索引”（叶子节点直接存整行记录），辅助索引叶子存主键值（查非索引列需“回表”）；MyISAM 是“非聚集索引”（叶子存数据行物理地址）",
        "C. 两者索引结构完全一模一样，没有任何区别",
        "D. InnoDB 不使用 B+ 树，而是使用普通链表"
      ],
      answer: 1,
      explanation: "经典面试与笔记重点：InnoDB 主键 B+ 树叶子直接挂载整行数据（聚集索引），二级索引叶子只存主键值，查询其他列时需拿主键回查主键树（即“回表”）；而 MyISAM 索引与数据文件分离，主/辅索引叶子均存数据记录地址。",
      tag: "InnoDBvsMyISAM"
    },
    {
      id: "q-06-10",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "在散列表（哈希表）的除留余数法 H(key) = key % p 中，除数 p 通常如何选取效果最好？",
      code: "",
      options: [
        "A. 取 2 的整数次幂（如 16、32）",
        "B. 取不大于表长 m 的最大质数（素数）",
        "C. 取 10 的整数次幂（如 100）",
        "D. 取关键字的最大值"
      ],
      answer: 1,
      explanation: "如果 p 是偶数或合数（如 10、16），容易和具有共同因子的 key 产生大量周期性冲突；选不大于表长 m 的质数（素数）能使散列地址分布最均匀，显著降低冲突率。",
      tag: "散列表"
    },
    {
      id: "q-06-11",
      chapterId: "06",
      difficulty: 2,
      type: "single",
      prompt: "关于散列表处理冲突的“开放定址法（线性探测）”与“链地址法（拉链法）”，下列说法错误的是？",
      code: "",
      options: [
        "A. 线性探测法容易产生“堆积（聚集）”现象，导致不同散列值的元素互相争夺连续空位",
        "B. 链地址法不会产生非同义词之间的堆积，且删除节点非常方便",
        "C. 开放定址法删除元素时，可以直接把该槽位清成“完全空”，不会影响后续元素的查找",
        "D. 装载因子 α = 表中元素数 / 散列表长度，α 越大，冲突概率越高"
      ],
      answer: 2,
      explanation: "C 是大坑！开放定址法直接把被删位置清成“空”会截断后续同义词的探测链，导致后面的元素明明在表里却查不到！因此开放定址法删除必须打上“逻辑删除墓碑标记（DELETED）”。",
      tag: "散列表"
    },
    {
      id: "q-06-12",
      chapterId: "06",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：索引查找（分块查找）要求“块内可以无序，但块间必须有序”（即后一块的最小关键字大于前一块的最大关键字），理想分块下平均时间复杂度为 O(√n)。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！分块查找先在有序索引表定位所属块（可顺序或折半），再在块内顺序查找。当每块大小为 √n 时，综合比较次数最小，为 O(√n)。",
      tag: "分块查找"
    },

    // ==================== 第 7 章：排序 (12 题) ====================
    {
      id: "q-07-01",
      chapterId: "07",
      difficulty: 1,
      type: "single",
      prompt: "【必背稳定性口诀】以下四组排序算法中，全部属于“稳定排序”的是哪一组？",
      code: "",
      options: [
        "A. 直接插入排序、冒泡排序、归并排序",
        "B. 快速排序、堆排序、简单选择排序",
        "C. 直接插入排序、希尔排序、归并排序",
        "D. 冒泡排序、快速排序、堆排序"
      ],
      answer: 0,
      explanation: "黄金口诀：稳定三兄弟（插入、冒泡、归并，另加非比较的计数/桶/基数）；不稳定四人组（快、选、堆、希——“快些选一堆”不稳定）！",
      tag: "排序稳定性"
    },
    {
      id: "q-07-02",
      chapterId: "07",
      difficulty: 1,
      type: "single",
      prompt: "如果待排序数组“本来就已经基本有序”，以下哪种排序算法的时间复杂度可以达到最优的 O(n)？",
      code: "",
      options: [
        "A. 简单选择排序",
        "B. 堆排序",
        "C. 直接插入排序（或带提前退出标志的冒泡排序）",
        "D. 以首元素为基准的朴素快速排序"
      ],
      answer: 2,
      explanation: "对已基本有序的数据，直接插入排序几乎不用搬移元素，仅需比较约 n-1 次即达 O(n)；带 swapped 标志的冒泡排序一趟无交换即退出也是 O(n)。而朴素首元素快排在有序时反而最惨，退化到 O(n²)！",
      tag: "排序复杂度"
    },
    {
      id: "q-07-03",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "在所有基于比较的排序算法中，哪两种算法即使在“最坏情况”下，时间复杂度依然严格保证是 O(n log n)？",
      code: "",
      options: [
        "A. 快速排序 和 归并排序",
        "B. 堆排序 和 归并排序",
        "C. 快速排序 和 堆排序",
        "D. 希尔排序 和 堆排序"
      ],
      answer: 1,
      explanation: "快排最坏会退化为 O(n²)；而堆排序（空间 O(1)，不稳定）和归并排序（空间 O(n)，稳定）无论输入多恶劣，最坏时间复杂度都稳如泰山地锁定在 O(n log n)！",
      tag: "排序复杂度"
    },
    {
      id: "q-07-04",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "朴素快速排序（固定选左端点为基准 pivot）在什么输入下会退化到 O(n²)？如何有效避免？",
      code: "",
      options: [
        "A. 随机乱序数组最容易退化；用冒泡代替即可",
        "B. 数组已完全有序或逆序时划分极度不平衡（0 与 n-1）；可用“随机选基准”或“三数取中”优化",
        "C. 数组元素全为正数时会退化；全部取负即可",
        "D. 快排永远不会退化到 O(n²)"
      ],
      answer: 1,
      explanation: "当数组已有序且总取首元素作 pivot，每次划分一边空、另一边 n-1 个，递归深度达 n，退化为 O(n²)。通过随机选基准或三数取中（首/中/尾取中位数）可将退化概率降到几乎为零。",
      tag: "快速排序"
    },
    {
      id: "q-07-05",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "关于堆排序，以下说法正确的是哪一项？",
      code: "",
      options: [
        "A. 升序排序通常建立小根堆，降序排序建立大根堆",
        "B. 从底向上原地建堆的时间复杂度是 O(n)，总排序时间复杂度 O(n log n)，额外空间 O(1)",
        "C. 堆排序是稳定排序",
        "D. 建堆时必须从索引 0 开始向后逐个下沉"
      ],
      answer: 1,
      explanation: "原地升序排序建“大根堆”（每次把堆顶最大值换到末尾归位）；建堆从最后一个非叶节点 n/2 - 1 倒着往前下沉，数学求和精确为 O(n)！总时间 O(n log n)，空间 O(1)，属不稳定排序。",
      tag: "堆排序"
    },
    {
      id: "q-07-06",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "在归并排序（二路归并）合并两个有序子数组时，下面哪一行决定了归并排序是否是“稳定”的？",
      code: "if (a[i] <= a[j]) temp[k++] = a[i++];\nelse              temp[k++] = a[j++];",
      options: [
        "A. 必须写 <=（相等时优先取左半边元素），若写成 < 就会破坏稳定性",
        "B. 写 < 还是 <= 都一样稳定",
        "C. 必须用递归才能稳定，迭代版不稳定",
        "D. 稳定性与 temp 数组大小有关"
      ],
      answer: 0,
      explanation: "当左半边 a[i] 与右半边 a[j] 相等时，a[i] 原本排在前面。只有写成 a[i] <= a[j] 优先拷贝左边的 a[i]，才能保持相等元素的原始相对次序（稳定）！",
      tag: "归并排序"
    },
    {
      id: "q-07-07",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "为什么“排序稳定性”在实际工程中非常重要？",
      code: "",
      options: [
        "A. 稳定排序一定比不稳定排序运行速度更快",
        "B. 稳定排序不需要任何额外内存",
        "C. 进行“多关键字排序”时（如先按学号排，再按成绩排），稳定排序能保证同分学生依然保持原先的学号顺序",
        "D. 只有稳定排序才能对负数进行排序"
      ],
      answer: 2,
      explanation: "稳定性的核心工程价值就是多关键字排序（例如电商商品先按销量排，再按价格排；学生先按学号排，再按成绩排），相等主键下能忠实保留次键顺序！",
      tag: "排序稳定性"
    },
    {
      id: "q-07-08",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "关于“简单选择排序”，无论初始数组是正序、逆序还是完全乱序，它的关键字比较总次数都是？",
      code: "",
      options: [
        "A. O(n)",
        "B. 恒定为 n(n - 1) / 2 次，与初始序列状态无关",
        "C. 最好 n 次，最坏 n² 次",
        "D. 恒定为 n log n 次"
      ],
      answer: 1,
      explanation: "简单选择排序每趟都要扫完剩余未排序区找最小值，第 1 趟比 n-1 次，…，第 n-1 趟比 1 次，总计恒为 n(n-1)/2 次，不受初始有序度影响（但交换次数最多仅 n-1 次）。",
      tag: "选择排序"
    },
    {
      id: "q-07-09",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "希尔排序（缩小增量排序）本质上是对哪种基本排序算法的改进？为什么希尔排序不稳定？",
      code: "",
      options: [
        "A. 对冒泡排序的改进；因为增量始终为 1",
        "B. 对直接插入排序的改进；因为按步长 gap 分组进行远距离跨组移动，可能把相同关键字的相对次序打乱",
        "C. 对归并排序的改进；因为使用了辅助数组",
        "D. 对堆排序的改进；因为构建了二叉树"
      ],
      answer: 1,
      explanation: "希尔排序先用大步长 gap 把数组分成若干子序列分别做直接插入排序，让小元素大步跳到前面，最后 gap=1 收尾；但相同元素可能被分到不同子序列各自移动，从而导致不稳定。",
      tag: "希尔排序"
    },
    {
      id: "q-07-10",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "以下哪种排序算法是“外部排序”（海量数据无法一次装入内存，需借助磁盘）的核心算法基础？",
      code: "",
      options: [
        "A. 快速排序",
        "B. 堆排序",
        "C. 多路归并排序",
        "D. 希尔排序"
      ],
      answer: 2,
      explanation: "外排序先把大文件分块读入内存排好序写回磁盘形成若干有序归并段，再用多路归并顺序读取合并（磁盘顺序 I/O 效率极高）。归并排序是外排序的绝对基石。",
      tag: "归并排序"
    },
    {
      id: "q-07-11",
      chapterId: "07",
      difficulty: 2,
      type: "single",
      prompt: "计数排序、桶排序、基数排序能够突破比较排序 Ω(n log n) 的时间下界，达到线性级 O(n+k) 或 O(d(n+k))，是因为它们？",
      code: "",
      options: [
        "A. 使用了更快的 CPU 指令",
        "B. 不依赖元素两两比较，而是直接利用待排关键字的数值范围或数位分布特征来定位",
        "C. 牺牲了排序正确性",
        "D. 只能排 10 个以内的数"
      ],
      answer: 1,
      explanation: "基于决策树下界定理，任何基于“两两比较”的排序最坏不可能快于 O(n log n)；计数/桶/基数排序不靠比较，而是利用值域或按位分桶计数，从而实现线性时间（且均稳定，但需额外空间与特定值域前提）。",
      tag: "非比较排序"
    },
    {
      id: "q-07-12",
      chapterId: "07",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：在教材第 7 章直接插入排序代码中，数据从 r[1..n] 存放，而 r[0] 用作“监视哨（哨兵）”，其作用是同时暂存待插元素并免去内层循环的数组越界判断 j >= 1。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！把待插入元素放进 r[0] 后，内层 while (r[0] < r[j]) 往前找时就算一直比到头也会在 j=0 处因为 r[0] < r[0] 为假而自动停下，省去每次循环的边界判断！",
      tag: "插入排序"
    },

    // ==================== 附录 A：异常处理 (8 题) ====================
    {
      id: "q-appA-01",
      chapterId: "appA",
      difficulty: 1,
      type: "single",
      prompt: "C++ 异常处理的三个核心关键字及其分工分别是？",
      code: "",
      options: [
        "A. try（抛出）、throw（捕获）、catch（警戒区）",
        "B. try（划定警戒区）、throw（抛出异常）、catch（捕获并处理异常）",
        "C. try（终止程序）、throw（打印日志）、catch（释放内存）",
        "D. new（申请）、throw（删除）、catch（恢复）"
      ],
      answer: 1,
      explanation: "火警三步曲：try 划定可能出错的警戒区 → 发现异常立即 throw 拉响警报 → catch 接住对应类型的警报灭火处理。",
      tag: "异常处理"
    },
    {
      id: "q-appA-02",
      chapterId: "appA",
      difficulty: 1,
      type: "single",
      prompt: "教材中顺序表 Get(i) 越界时采用 throw \"查找位置非法\"; 而不是打印错误并 return -1;，最本质的优势在于？",
      code: "",
      options: [
        "A. throw 运行速度比 return 快 100 倍",
        "B. 不会把错误码 -1 与合法数据混淆，且强制调用者必须处理异常（否则程序立即中止，不会带着脏数据继续运行）",
        "C. cout 在类成员函数中不能使用",
        "D. return -1 会导致编译错误"
      ],
      answer: 1,
      explanation: "return -1 存在三大痛点：调用者可能忘检查、-1 可能是表里合法存的数据、程序带着错数据继续往下跑埋雷。throw 将“错误处理”与“正常返回值”彻底解耦，错误藏不住！",
      tag: "异常处理"
    },
    {
      id: "q-appA-03",
      chapterId: "appA",
      difficulty: 1,
      type: "single",
      prompt: "运行下面代码，屏幕最终输出的结果是？",
      code: "try {\n    cout << \"1 \";\n    throw \"err\";\n    cout << \"2 \";\n} catch (const char* e) {\n    cout << \"3 \";\n}\ncout << \"4\";",
      options: [
        "A. 1 2 3 4",
        "B. 1 3 4",
        "C. 1 3",
        "D. 3 4"
      ],
      answer: 1,
      explanation: "一旦执行 throw，立即跳出 try 块，throw 后面的 cout << \"2 \" 绝不会执行；随后进入匹配的 catch 输出 3，处理完毕后 try-catch 之后的 cout << \"4\" 照常执行！",
      tag: "异常处理"
    },
    {
      id: "q-appA-04",
      chapterId: "appA",
      difficulty: 2,
      type: "single",
      prompt: "下面代码运行时会发生什么结果？",
      code: "try {\n    throw 42;\n} catch (const char* msg) {\n    cout << \"Caught: \" << msg;\n}",
      options: [
        "A. 自动把 42 转成字符串 \"42\" 并输出 Caught: 42",
        "B. 无法捕获！因为 catch 严格按类型匹配，int 不能匹配 const char*，最终导致程序调用 std::terminate 异常终止",
        "C. 编译阶段直接报错",
        "D. 静默跳过 catch 块，什么都不输出且程序正常结束"
      ],
      answer: 1,
      explanation: "C++ 的 catch 严格按类型匹配（不做普通隐式类型转换）。抛出 int(42) 只能被 catch(int) 或万能兜底 catch(...) 接住，没人接就会触发程序终止！",
      tag: "异常处理"
    },
    {
      id: "q-appA-05",
      chapterId: "appA",
      difficulty: 2,
      type: "single",
      prompt: "当一个 try 块后跟有多个 catch 块，包含针对具体类型的 catch 和万能兜底的 catch (...) 时，catch (...) 必须放在什么位置？",
      code: "",
      options: [
        "A. 必须放在所有 catch 块的最前面",
        "B. 必须放在所有 catch 块的最后面",
        "C. 放在任意位置效果完全一样",
        "D. 只能单独出现，不能和其他 catch 共存"
      ],
      answer: 1,
      explanation: "catch 块是从上到下顺序匹配的。catch (...) 会拦截所有异常，必须放在最后兜底（否则放前面会让后面的具体 catch 永远无法到达，甚至直接编译报错）。",
      tag: "异常处理"
    },
    {
      id: "q-appA-06",
      chapterId: "appA",
      difficulty: 2,
      type: "single",
      prompt: "当函数 A 调用 B、B 调用 C，而 C 内部执行了 throw 异常但 B 没有 try-catch，只有 A 写了匹配的 catch 时，会发生什么？",
      code: "",
      options: [
        "A. 因为 B 没写 catch，程序立即崩溃",
        "B. 异常会自动沿函数调用栈向上传播（栈展开 Stack Unwinding），跳过 B 直到被 A 的 catch 捕获",
        "C. 异常会被自动丢弃，B 继续往下执行",
        "D. 必须在 B 中手动重新 return 错误码"
      ],
      answer: 1,
      explanation: "异常的巨大威力在于“跨层自动向上传播”：找不到匹配的 catch 时会自动逐层退出当前函数并析构局部对象（栈展开），直到外层遇到能接住它的 catch！",
      tag: "异常处理"
    },
    {
      id: "q-appA-07",
      chapterId: "appA",
      difficulty: 2,
      type: "single",
      prompt: "以下关于 C++ 异常处理的最佳实践，哪一项是正确的？",
      code: "",
      options: [
        "A. 把整个 main 函数塞进一个大 try 块里，catch 里面留空什么都不写",
        "B. 可以用 throw/catch 替代普通 if-else 和 for 循环退出条件",
        "C. 绝对不要在类的析构函数中抛出未捕获的异常（否则栈展开期间触发双重异常会导致程序直接 abort 崩溃）",
        "D. 所有标准异常类都必须用值传递而非 const 引用捕获"
      ],
      answer: 2,
      explanation: "教材附录 A 明确警示四大误区：① 不要把 try 包得过大；② 不要 catch 后空吞异常；③ 不要拿异常做正常流程控制；④ 切忌在析构函数中抛异常！另外标准异常推荐 const std::exception& 按引用捕获。",
      tag: "异常最佳实践"
    },
    {
      id: "q-appA-08",
      chapterId: "appA",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：在 C++ 中，如果捕获到异常后在 catch 块内只写一句 throw;（不带操作数），其含义是将当前捕获的原异常原封不动地重新向上抛出。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！在 catch 块中写裸 throw; 称为“重新抛出（rethrow）”，常用于底层函数先记录日志或清理资源，再把原异常交给更上层调用者决定如何恢复。",
      tag: "异常处理"
    },

    // ==================== 附录 B：模板 (8 题) ====================
    {
      id: "q-appB-01",
      chapterId: "appB",
      difficulty: 1,
      type: "single",
      prompt: "在声明 C++ 模板参数时，template <class T> 和 template <typename T> 有什么区别？",
      code: "",
      options: [
        "A. class T 只能传入类类型，typename T 只能传入 int 等基本类型",
        "B. 两者在声明模板类型参数时完全等价，没有任何功能区别",
        "C. typename T 只能用于函数模板，不能用于类模板",
        "D. class T 运行效率更高"
      ],
      answer: 1,
      explanation: "两者在模板参数列表中完全等价！教材习惯写 template <class T>，现代 C++ 更推崇 template <typename T> 以免初学者误解“T 必须是 class”。",
      tag: "模板基础"
    },
    {
      id: "q-appB-02",
      chapterId: "appB",
      difficulty: 2,
      type: "single",
      prompt: "已知函数模板 template <class T> T Max(T x, T y) { return x >= y ? x : y; }，下面哪一行调用会“编译报错”？",
      code: "",
      options: [
        "A. Max(3, 5);",
        "B. Max(3.6, 2.5);",
        "C. Max(3, 2.5);",
        "D. Max<double>(3, 2.5);"
      ],
      answer: 2,
      explanation: "Max(3, 2.5) 中实参 3 是 int、2.5 是 double，函数模板自动推导不会做隐式转换，编译器不知道 T 该推导为 int 还是 double 因而报错！显式写 Max<double>(3, 2.5) 即可通过。",
      tag: "函数模板"
    },
    {
      id: "q-appB-03",
      chapterId: "appB",
      difficulty: 2,
      type: "single",
      prompt: "在类模板外部实现其成员函数时，下面哪一种写法是完全正确的？（教材附录 B 勘误高频坑）",
      code: "template <class T>\nclass Box {\n    T val;\npublic:\n    T getVal();\n};",
      options: [
        "A. T Box::getVal() { return val; }",
        "B. template <class T> T getVal() { return val; }",
        "C. template <class T> T Box<T>::getVal() { return val; }",
        "D. T Box<T>::getVal() { return val; }"
      ],
      answer: 2,
      explanation: "类模板成员函数类外实现必须齐备三要素：① 重新写 template <class T>；② 返回类型 T；③ 作用域必须带上模板参数 Box<T>::！缺任何一个都会编译失败。",
      tag: "类模板"
    },
    {
      id: "q-appB-04",
      chapterId: "appB",
      difficulty: 1,
      type: "single",
      prompt: "把 int 版的顺序表改写为类模板 SeqList<T> 时，成员变量 int data[100]; 和 int length; 应该如何修改？",
      code: "",
      options: [
        "A. 全部改成 T：T data[100]; 和 T length;",
        "B. 仅把存放数据的类型改为 T（T data[100];），表示元素个数、下标、容量的 length 必须保持 int",
        "C. data 保持 int，把 length 改成 T",
        "D. 两者都不需要改"
      ],
      answer: 1,
      explanation: "经典初学者大坑！T 代表表里存放的元素类型（可能是 string、Student）。如果把 length 改成 T，当 T=string 时“表长”就成了字符串！记住：个数/下标/位序/容量永远是 int。",
      tag: "类模板"
    },
    {
      id: "q-appB-05",
      chapterId: "appB",
      difficulty: 2,
      type: "single",
      prompt: "关于类模板的实例化（如教材中的 template <class T> class SeqList），以下哪种定义对象的写法正确？",
      code: "",
      options: [
        "A. SeqList list;",
        "B. SeqList<int> list;",
        "C. SeqList(int) list;",
        "D. template SeqList list;"
      ],
      answer: 1,
      explanation: "类模板本身是“制造类的模具”而不是真正的类型，在 C++11/教材写法中实例化对象时必须在类名后用尖括号显式指定具体类型参数，如 SeqList<int> list;。",
      tag: "类模板"
    },
    {
      id: "q-appB-06",
      chapterId: "appB",
      difficulty: 2,
      type: "single",
      prompt: "观察下方带“非类型参数”的类模板声明，其中参数 int n 的含义是？（教材附录 2）",
      code: "template <class T, int n>\nclass ArrayMax {\n    T m_data[n];\n};",
      options: [
        "A. n 可以在程序运行时由用户 cin 输入决定",
        "B. n 是一个编译期确定的整型常量参数，实例化时如 ArrayMax<int, 5> 直接决定数组长度",
        "C. 模板尖括号里不允许出现 int，这是语法错误",
        "D. n 表示需要创建 n 个不同的类对象"
      ],
      answer: 1,
      explanation: "模板参数除了类型参数（class T）外，还支持非类型常量参数（如 int n），必须在编译期确定（如 ArrayMax<int, 5>），STL 中的 std::array<int, 5> 正是这种机制！",
      tag: "非类型模板参数"
    },
    {
      id: "q-appB-07",
      chapterId: "appB",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：C++ 模板是在“编译期”根据实际使用的类型（如 SeqList<int>、SeqList<double>）自动生成对应代码，不会带来额外的运行时类型判断开销。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！C++ 模板属于编译期多态（静态泛型），编译器会像模具冲压一样直接为每种用到的类型生成原生高效的机器代码，零运行时额外开销。",
      tag: "模板原理"
    },
    {
      id: "q-appB-08",
      chapterId: "appB",
      difficulty: 1,
      type: "judge",
      prompt: "判断题：类模板的成员函数如果直接写在类定义的大括号 { ... } 内部，就可以省去类外繁琐的 template <class T> 和 ClassName<T>:: 前缀，最适合初学者减少语法报错。",
      code: "",
      options: ["A. 正确", "B. 错误"],
      answer: 0,
      explanation: "正确！把模板成员函数直接实现在类体内部既简洁又不容易漏写 <T>，而且避免了头文件/源文件分离编译时的链接找不到模板定义问题。",
      tag: "类模板"
    }
  ];

  global.__DS_Q_ALL = (global.__DS_Q_PART1 || []).concat(questionsPart2);
  delete global.__DS_Q_PART1;
})(typeof window !== "undefined" ? window : globalThis);

(function (global) {
  "use strict";

  var bugCases = [
    // ==================== 第 0 章：3 例 ====================
    {
      id: "bug-00-1",
      chapterId: "00",
      title: "野指针强行赋值：一运行就段错误崩溃",
      desc: "想用指针 p 把数值 10 写入内存，结果程序一运行直接 Segmentation Fault！请点击存在致命 Bug 的那一行。",
      codeLines: [
        "void setTen() {",
        "    int* p;",
        "    *p = 10;",
        "    cout << *p << endl;",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 3 行：指针 p 未初始化就解引用写入（野指针），向随机垃圾地址强行写数据导致段错误",
        "第 3 行：int* 指针不能存储整数 10",
        "第 3 行：应该写成 p = 10; 而不是 *p = 10;",
        "第 4 行：cout 不能打印指针解引用的值"
      ],
      answerIdx: 0,
      explanation: "局部指针变量 int* p; 声明时里面存放的是随机垃圾地址。在第 3 行执行 *p = 10; 相当于往操作系统未分配给你的非法内存强行写值，直接触发段错误（Segmentation Fault）。指针必须先指向合法变量或堆内存！",
      fixCode: "int x = 0;\nint* p = &x;  // 或 int* p = new int(0);\n*p = 10;"
    },
    {
      id: "bug-00-2",
      chapterId: "00",
      title: "传值指针头插：函数跑完了 head 还是 nullptr",
      desc: "写了 pushFront 想往单链表头部插入新节点，但 main 函数调用完后打印 head 发现依然是空链表！点击出问题的那一行。",
      codeLines: [
        "struct Node { int data; Node* next; };",
        "void pushFront(Node* head, int x) {",
        "    Node* s = new Node{x, head};",
        "    head = s;",
        "}"
      ],
      bugLine: 2,
      choices: [
        "第 3 行：new Node 不能用花括号初始化",
        "第 2 行：形参 Node* head 是按值传递的指针副本，函数内修改 head 无法影响外部实参",
        "第 4 行：应该写成 *head = *s;",
        "第 1 行：结构体成员不能包含指向自身类型的指针"
      ],
      answerIdx: 1,
      explanation: "C++ 函数参数默认按值传递！传入 Node* head 时，形参 head 只是外部头指针的地址拷贝。第 4 行改了形参副本 head = s，外部的真实 head 纹丝不动，新 new 出来的节点还造成了内存泄漏！改为指针引用 Node*& head 即可。",
      fixCode: "void pushFront(Node*& head, int x) {\n    Node* s = new Node{x, head};\n    head = s;\n}"
    },
    {
      id: "bug-00-3",
      chapterId: "00",
      title: "释放链表先 delete 断链：Use-After-Free 崩溃",
      desc: "想用 destroyList 回收整条单链表的内存，结果运行时随机崩溃或漏删内存！请揪出“先炸桥再过桥”的那一行。",
      codeLines: [
        "void destroyList(Node*& head) {",
        "    Node* cur = head;",
        "    while (cur != nullptr) {",
        "        delete cur;",
        "        cur = cur->next;",
        "    }",
        "    head = nullptr;",
        "}"
      ],
      bugLine: 5,
      choices: [
        "第 3 行：while 条件应写成 cur->next != nullptr",
        "第 5 行：第 4 行已经 delete cur 归还了内存，第 5 行再去读 cur->next 属于 Use-After-Free 未定义行为",
        "第 4 行：释放单个节点应该使用 delete[] cur;",
        "第 7 行：不应该把 head 置为 nullptr"
      ],
      answerIdx: 1,
      explanation: "一旦执行 delete cur，该节点内存即刻失效。紧接着第 5 行读取 cur->next 相当于“先把桥炸毁，再从桥上走去对岸”，属于典型 Use-After-Free！正确姿势是先 Node* nxt = cur->next 留好后路，再 delete cur，最后 cur = nxt。",
      fixCode: "while (cur != nullptr) {\n    Node* nxt = cur->next; // ① 先留后路\n    delete cur;            // ② 再拆当前节点\n    cur = nxt;             // ③ 跳到下家\n}"
    },

    // ==================== 第 1 章：3 例 ====================
    {
      id: "bug-01-1",
      chapterId: "01",
      title: "字符频次统计：一输入中文或扩展字符就负下标越界",
      desc: "按照教材第 1 章统计 ASCII 字符出现次数的思路写了 countChars，英文测试全过，一输入含中文的字符串就崩溃！点击罪魁祸首那一行。",
      codeLines: [
        "void countChars(const char* s, int chnum[256]) {",
        "    while (*s != '\\0') {",
        "        chnum[*s]++;",
        "        s++;",
        "    }",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 2 行：字符串结束符应该是 '0' 而不是 '\\0'",
        "第 3 行：x86 平台上 char 默认是有符号类型（-128~127），遇到扩展字符/中文时 *s 为负数，导致 chnum[负数] 越界",
        "第 4 行：指针 s++ 每次会跳过 4 个字符",
        "第 1 行：数组大小 256 太小，至少需要 10000"
      ],
      answerIdx: 1,
      explanation: "经典初学者噩梦！多数编译器中 char 默认为 signed char（范围 -128~127）。中文 UTF-8/GBK 字节最高位为 1，直接当下标 *s 会变成负数，瞬间越界写坏栈内存！必须强转为 (unsigned char)(*s)。",
      fixCode: "chnum[(unsigned char)(*s)]++;"
    },
    {
      id: "bug-01-2",
      chapterId: "01",
      title: "统计字符串长度：程序跑起来卡死无限循环",
      desc: "手写 myStrlen 统计字符串长度，只要传入非空字符串，程序就会彻底卡死超时（TLE）！点击遗漏或出错的关键行。",
      codeLines: [
        "int myStrlen(const char* s) {",
        "    int len = 0;",
        "    while (*s != '\\0') {",
        "        len++;",
        "    }",
        "    return len;",
        "}"
      ],
      bugLine: 4,
      choices: [
        "第 2 行：len 应该初始化为 1",
        "第 4 行：循环体内只做了 len++，忘了推进指针 s++，导致 *s 永远指向首字符而死循环",
        "第 3 行：while 条件应该写成 s != nullptr",
        "第 6 行：应该返回 len - 1"
      ],
      answerIdx: 1,
      explanation: "用 while 遍历字符串或链表时，最容易犯的错就是只顾着更新计数器 len++，却忘了把游标指针 s++ 往后挪一格！*s 永远不等于 '\\0'，直接无限死循环。",
      fixCode: "while (*s != '\\0') {\n    len++;\n    s++;   // 切记推进指针！\n}"
    },
    {
      id: "bug-01-3",
      chapterId: "01",
      title: "伪缩进陷阱：想写 O(n²) 嵌套统计，结果只跑了 O(n)",
      desc: "想让每轮外层循环 i 都执行一次内层循环累加 sum（期望 n=3 时输出 9），结果实际输出了 3！点击制造“假嵌套”的那一行。",
      codeLines: [
        "int calc(int n) {",
        "    int cnt = 0, sum = 0;",
        "    for (int i = 0; i < n; i++)",
        "        cnt++;",
        "        for (int j = 0; j < n; j++)",
        "            sum++;",
        "    return sum;",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 3 行：外层 for 缺少大括号 { }，C++ 只把紧跟的 cnt++; 视为循环体，下面的 for (j) 成了并列循环",
        "第 5 行：内层循环变量不能叫 j",
        "第 2 行：cnt 和 sum 不能写在同一行初始化",
        "第 6 行：sum++ 应该写成 sum += i"
      ],
      answerIdx: 0,
      explanation: "教材习题 1 原汁原味的缩进大坑！C/C++ 不像 Python 靠缩进划分代码块，无大括号的 for 只管辖后面 1 条语句。加上 { ... } 才能真正嵌套（不加时复杂度仅为 O(n) 而非 O(n²)）。",
      fixCode: "for (int i = 0; i < n; i++) {\n    cnt++;\n    for (int j = 0; j < n; j++)\n        sum++;\n}"
    },

    // ==================== 第 2 章：3 例 ====================
    {
      id: "bug-02-1",
      chapterId: "02",
      title: "顺序表插入：插完后后面元素全变成了同一个数！",
      desc: "向顺序表 [10, 20, 30, 40] 的下标 1 处插入 99，期望得到 [10, 99, 20, 30, 40]，结果变成了 [10, 99, 20, 20, 20]！点击写反方向的那一行。",
      codeLines: [
        "void seqInsert(int a[], int& len, int idx, int x) {",
        "    for (int j = idx; j < len; j++) {",
        "        a[j + 1] = a[j];",
        "    }",
        "    a[idx] = x;",
        "    len++;",
        "}"
      ],
      bugLine: 2,
      choices: [
        "第 5 行：应该在搬移循环之前赋值 a[idx] = x",
        "第 2 行：插入搬移必须“从后往前”倒着搬（j = len-1 降到 idx），正向循环会把 a[idx] 不断覆盖后面的全部元素",
        "第 6 行：插入元素后不需要 len++",
        "第 3 行：应该写成 a[j] = a[j + 1]"
      ],
      answerIdx: 1,
      explanation: "顺序表插入口诀：“插入从后往前腾位，删除从前往后补位”！从前往后执行 a[j+1] = a[j] 会先覆盖掉原本的 a[idx+1]，下一轮又把刚覆盖的值继续往后复制，产生多米诺骨牌式的覆盖灾难！",
      fixCode: "for (int j = len - 1; j >= idx; j--) {\n    a[j + 1] = a[j];\n}"
    },
    {
      id: "bug-02-2",
      chapterId: "02",
      title: "单链表按值查找：找得到正常，查不到当场崩溃",
      desc: "手写单链表查找值为 x 的节点，只要链表里有 x 就返回正确，只要 x 不在链表里就立刻段错误崩溃！点击逻辑顺序写反的那一行。",
      codeLines: [
        "Node* findVal(Node* head, int x) {",
        "    Node* p = head->next;",
        "    while (p->data != x && p != nullptr) {",
        "        p = p->next;",
        "    }",
        "    return p;",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 2 行：带头结点链表应该从 p = head 开始",
        "第 3 行：短路求值 && 左右顺序写反！当 p 走到 nullptr 时先解引用了 p->data 导致空指针崩溃",
        "第 4 行：应该写成 p++;",
        "第 6 行：查不到时应该 return 0 而不是 return p"
      ],
      answerIdx: 1,
      explanation: "C++ 的 && 从左到右短路求值！必须把判空条件 p != nullptr 写在最左边，这样 p 为空时直接短路跳出循环，绝不会执行右边的 p->data！写反就是必踩的空指针地雷。",
      fixCode: "while (p != nullptr && p->data != x) {"
    },
    {
      id: "bug-02-3",
      chapterId: "02",
      title: "双链表插入：中间插都正常，一往表尾插就崩溃",
      desc: "在双链表节点 p 之后插入新节点 s，在链表中间测试全部通过，但当 p 恰好是最后一个节点（p->next == nullptr）时瞬间崩溃！点击踩雷行。",
      codeLines: [
        "void insertAfter(DNode* p, DNode* s) {",
        "    s->next = p->next;",
        "    s->prior = p;",
        "    p->next->prior = s;",
        "    p->next = s;",
        "}"
      ],
      bugLine: 4,
      choices: [
        "第 2 行：s->next 应该先置为 nullptr",
        "第 4 行：当 p 是尾节点时 p->next 为 nullptr，直接访问 p->next->prior 会解引用空指针崩溃",
        "第 3 行：s->prior 应该指向 p->next",
        "第 5 行：p->next = s 应该放在第 2 行之前"
      ],
      answerIdx: 1,
      explanation: "双链表尾插/尾删铁律：只要涉及修改 p->next->prior，必须先判断 if (p->next != nullptr)！因为尾节点后面没有后继节点，直接解引用 p->next->prior 必然段错误。",
      fixCode: "if (p->next != nullptr) {\n    p->next->prior = s;\n}"
    },

    // ==================== 第 3 章：3 例 ====================
    {
      id: "bug-03-1",
      chapterId: "03",
      title: "循环队列入队：多绕一圈就数组越界崩溃",
      desc: "写了一个容量为 maxSize 的循环队列，前面几次入队出队正常，多入队几轮后直接发生越界内存踩踏！点击忘记“绕回圆盘”的那一行。",
      codeLines: [
        "bool enqueue(CirQueue& q, int x) {",
        "    if ((q.rear + 1) % q.maxSize == q.front) return false;",
        "    q.data[q.rear] = x;",
        "    q.rear = q.rear + 1;",
        "    return true;",
        "}"
      ],
      bugLine: 4,
      choices: [
        "第 2 行：判满条件应该是 q.rear == q.front",
        "第 4 行：rear 前进忘了对 maxSize 取模，到达数组末尾后无法绕回下标 0 导致数组越界",
        "第 3 行：应该把 x 存到 q.data[q.front]",
        "第 1 行：形参不应该使用引用 CirQueue&"
      ],
      answerIdx: 1,
      explanation: "循环队列的灵魂就是“模运算绕环”！rear 和 front 每次前进都必须写成 (rear + 1) % maxSize 和 (front + 1) % maxSize，漏掉 % maxSize 就退化成普通数组，绕圈立刻越界。",
      fixCode: "q.rear = (q.rear + 1) % q.maxSize;"
    },
    {
      id: "bug-03-2",
      chapterId: "03",
      title: "括号匹配：输入多余右括号 \")\" 时直接崩溃",
      desc: "用栈做括号匹配，输入 \"(())\" 和 \"()[]{}\" 全对，但一测试非法输入 \")(\" 或 \"]\" 程序立刻崩溃！点击缺少安全检查的那一行。",
      codeLines: [
        "bool isValid(const string& s) {",
        "    stack<char> st;",
        "    for (char c : s) {",
        "        if (c == '(' || c == '[' || c == '{') st.push(c);",
        "        else {",
        "            char top = st.top();",
        "            if ((c == ')' && top != '(') || (c == ']' && top != '[') || (c == '}' && top != '{')) return false;",
        "            st.pop();",
        "        }",
        "    }",
        "    return st.empty();",
        "}"
      ],
      bugLine: 6,
      choices: [
        "第 4 行：左括号不应该入栈",
        "第 6 行：遇到右括号时未先检查 if (st.empty()) return false;，对空栈直接调用 st.top() 会引发未定义行为/崩溃",
        "第 11 行：循环结束时应该返回 true 而不是 st.empty()",
        "第 8 行：不应该执行 st.pop()"
      ],
      answerIdx: 1,
      explanation: "用 std::stack 时铁律：任何调用 st.top() 或 st.pop() 之前，必须确保 !st.empty()！当输入以右括号开头（如 \")\"）时栈为空，直接 st.top() 必然崩溃。（另外循环结束后 return st.empty() 才能拦住 \"(((\"）。",
      fixCode: "if (st.empty()) return false;\nchar top = st.top();"
    },
    {
      id: "bug-03-3",
      chapterId: "03",
      title: "KMP 构建 next 数组：遇 \"ababaca\" 算错失配回退",
      desc: "手写 0-based KMP 前缀函数 buildNext，在 \"abab\" 上凑巧对了，一测 \"ababaca\" 就算出错误结果！请找出回退不够彻底的那一行。",
      codeLines: [
        "void buildNext(const string& p, int next[]) {",
        "    next[0] = 0;",
        "    int j = 0;",
        "    for (int i = 1; i < (int)p.size(); i++) {",
        "        if (j > 0 && p[i] != p[j]) j = next[j - 1];",
        "        if (p[i] == p[j]) j++;",
        "        next[i] = j;",
        "    }",
        "}"
      ],
      bugLine: 5,
      choices: [
        "第 2 行：0-based 下 next[0] 应该是 1",
        "第 5 行：失配回退写成了 if 而不是 while，遇到需要连续多级回退（如 3→1→0）时只退一步就停下，导致 next 算错",
        "第 6 行：应该写成 while (p[i] == p[j]) j++;",
        "第 4 行：i 应该从 0 开始循环"
      ],
      answerIdx: 1,
      explanation: "KMP 最经典的 Bug！对 \"ababaca\"，走到 'c'(i=5) 时当前最长前后缀长 j=3(\"aba\")，p[5]='c' != p[3]='b'，回退一次 j=next[2]=1 后 p[1]='b' 仍不等于 'c'，必须继续 while 回退到 j=next[0]=0！用 if 只退一次必然出错。",
      fixCode: "while (j > 0 && p[i] != p[j]) {\n    j = next[j - 1];\n}"
    },

    // ==================== 第 4 章：3 例 ====================
    {
      id: "bug-04-1",
      chapterId: "04",
      title: "销毁二叉树：写成前序释放导致随机段错误",
      desc: "想递归释放整棵二叉树的所有节点内存，结果测试大树时发生崩溃或内存访问错误！请点击顺序写错的那一行。",
      codeLines: [
        "void destroyTree(BiNode* root) {",
        "    if (root == nullptr) return;",
        "    delete root;",
        "    destroyTree(root->left);",
        "    destroyTree(root->right);",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 2 行：空树不需要 return",
        "第 3 行：前序先 delete root 销毁了当前节点，第 4、5 行再去访问 root->left/right 属于释放后使用（Use-After-Free），必须改用后序",
        "第 4 行：应该先销毁右子树再销毁左子树",
        "第 1 行：BiNode* 必须是数组"
      ],
      answerIdx: 1,
      explanation: "销毁二叉树是“后序遍历（左右根）”的经典铁证！必须先把左子树和右子树全部递归销毁干净，最后才能执行 delete root。把 delete root 放在前面就像先把树干锯断，再企图沿着树干去砍树枝！",
      fixCode: "destroyTree(root->left);\ndestroyTree(root->right);\ndelete root;"
    },
    {
      id: "bug-04-2",
      chapterId: "04",
      title: "二叉树层序遍历：空树一测立刻空指针崩溃",
      desc: "用队列实现二叉树层序遍历（BFS），非空树输出完美，但传入空树 root == nullptr 时程序当场崩溃！点击埋雷的那一行。",
      codeLines: [
        "void levelOrder(BiNode* root) {",
        "    queue<BiNode*> q;",
        "    q.push(root);",
        "    while (!q.empty()) {",
        "        BiNode* cur = q.front(); q.pop();",
        "        cout << cur->data << \" \";",
        "        if (cur->left) q.push(cur->left);",
        "        if (cur->right) q.push(cur->right);",
        "    }",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 2 行：层序遍历应该用 stack 而不是 queue",
        "第 3 行：未判空树就把 nullptr 推进队列，导致后面取出 cur == nullptr 后直接执行 cur->data 触发段错误",
        "第 7 行：左孩子应该先输出再入队",
        "第 5 行：应该先 pop 再取 front"
      ],
      answerIdx: 1,
      explanation: "当 root == nullptr 时，直接 q.push(root) 会让队列长度变为 1（里面装着一个空指针），从而进入 while 循环并在第 6 行执行 nullptr->data 瞬间崩溃！函数入口必须先写 if (root == nullptr) return;。",
      fixCode: "if (root == nullptr) return;\nqueue<BiNode*> q;\nq.push(root);"
    },
    {
      id: "bug-04-3",
      chapterId: "04",
      title: "统计叶子节点：遇到单孩子节点直接段错误",
      desc: "递归统计二叉树中叶子节点个数，满二叉树测试通过，但只要树里存在“只有左孩子或只有右孩子”的节点，一跑就炸！点击漏掉关键防线的行。",
      codeLines: [
        "int countLeaves(BiNode* root) {",
        "    if (root->left == nullptr && root->right == nullptr) {",
        "        return 1;",
        "    }",
        "    return countLeaves(root->left) + countLeaves(root->right);",
        "}"
      ],
      bugLine: 2,
      choices: [
        "第 3 行：叶子节点应该返回 0",
        "第 2 行：缺少空树出口 if (root == nullptr) return 0;，遇到单孩子节点递归到空子树后直接访问 nullptr->left 崩溃",
        "第 5 行：应该用乘法而不是加法",
        "第 2 行：判断叶子应该用 || 而不是 &&"
      ],
      answerIdx: 1,
      explanation: "树递归的第一条军规：首行必写 if (root == nullptr) return 基准值;！如果一个节点只有左孩子，第 5 行依然会递归调用 countLeaves(root->right)（传入 nullptr），第 2 行直接解引用 nullptr->left 当场崩溃。",
      fixCode: "if (root == nullptr) return 0;\nif (root->left == nullptr && root->right == nullptr) return 1;"
    },

    // ==================== 第 5 章：3 例 ====================
    {
      id: "bug-05-1",
      chapterId: "05",
      title: "图 BFS 遍历：同一个顶点被重复访问多次！",
      desc: "写图的广度优先搜索（BFS），在含环或菱形路径的图中，某些顶点竟然被打印了好几次、甚至队列爆炸！点击标记时机错位的行。",
      codeLines: [
        "void bfs(int start) {",
        "    queue<int> q;",
        "    q.push(start);",
        "    while (!q.empty()) {",
        "        int u = q.front(); q.pop();",
        "        visited[u] = true;",
        "        cout << u << \" \";",
        "        for (int v : adj[u]) {",
        "            if (!visited[v]) q.push(v);",
        "        }",
        "    }",
        "}"
      ],
      bugLine: 6,
      choices: [
        "第 3 行：起点不应该入队",
        "第 6 行：出队时才标记 visited[u] 太晚了！同层多个节点会同时发现未标记的共同邻居 v 并把它反复塞进队列，必须在入队时立刻标记",
        "第 5 行：应该用 q.back() 取出队尾元素",
        "第 8 行：邻接表不能用范围 for 遍历"
      ],
      answerIdx: 1,
      explanation: "BFS 黄金法则：“入队即标记 visited”！若拖到出队才标，假设 A 和 B 都在队中且都连着 C，A 出队把 C 入队（此时 C 尚未标记），紧接着 B 出队又把 C 再次入队！不仅重复输出，在稠密图上还会让队列暴涨至 O(V²)！",
      fixCode: "visited[start] = true;\nq.push(start);\n// 入队邻居时：\nif (!visited[v]) { visited[v] = true; q.push(v); }"
    },
    {
      id: "bug-05-2",
      chapterId: "05",
      title: "遍历整张图：遇到非连通图直接漏掉一半顶点",
      desc: "写一个函数 traverseGraph(n) 要求遍历图中所有 n 个顶点，但在包含两个独立连通块的非连通图上，只打印了前半个连通块！点击缺陷行。",
      codeLines: [
        "void traverseGraph(int n) {",
        "    fill(visited, visited + n, false);",
        "    dfs(0);",
        "}"
      ],
      bugLine: 3,
      choices: [
        "第 2 行：visited 数组应该初始化为 true",
        "第 3 行：只从顶点 0 启动了一次 dfs(0)，无法到达与 0 不连通的其他连通分量，必须外层循环检查每个未访问顶点",
        "第 3 行：应该改成 bfs(0) 就能遍历非连通图",
        "第 1 行：顶点数 n 必须大于 10"
      ],
      answerIdx: 1,
      explanation: "无论是 DFS 还是 BFS，单次调用只能走遍起点所在的那个“连通分量”。要遍历整张图（可能非连通或有孤立点），外层必须套一个 for (int i = 0; i < n; i++) if (!visited[i]) dfs(i);！",
      fixCode: "for (int i = 0; i < n; i++) {\n    if (!visited[i]) dfs(i);\n}"
    },
    {
      id: "bug-05-3",
      chapterId: "05",
      title: "Dijkstra 最短路：不可达点松弛导致整型溢出变负数",
      desc: "用 INT_MAX（约 21 亿）表示无穷大 INF 写 Dijkstra，遇到含不可达顶点的图时，dist 数组里居然算出了诡异的负二十亿！点击触发溢出的行。",
      codeLines: [
        "const int INF = INT_MAX;",
        "for (int v = 0; v < n; v++) {",
        "    if (!vis[v] && g[u][v] < INF) {",
        "        if (dist[u] + g[u][v] < dist[v]) {",
        "            dist[v] = dist[u] + g[u][v];",
        "        }",
        "    }",
        "}"
      ],
      bugLine: 4,
      choices: [
        "第 3 行：应该写成 g[u][v] > INF",
        "第 4 行：当 u 自身不可达（dist[u] == INF = INT_MAX）时，dist[u] + g[u][v] 发生有符号 int 溢出变成巨大负数，错误触发松弛",
        "第 2 行：循环变量 v 应该从 1 开始",
        "第 5 行：应该写成 dist[v] += g[u][v]"
      ],
      answerIdx: 1,
      explanation: "经典溢出炸弹！若用 INT_MAX 做 INF 且未判断 dist[u] != INF，一旦 dist[u] == INT_MAX 加上正边权 g[u][v]，就会溢出翻转为约 -2147483640，比 dist[v] 小得多，彻底污染整张最短路表！建议用 0x3f3f3f3f 做 INF 并额外加判 dist[u] != INF。",
      fixCode: "const int INF = 0x3f3f3f3f; // 约 10^9，两倍不溢出\nif (dist[u] != INF && dist[u] + g[u][v] < dist[v]) {"
    },

    // ==================== 第 6 章：3 例 ====================
    {
      id: "bug-06-1",
      chapterId: "06",
      title: "二分查找：查一个不存在的大数直接死循环卡死",
      desc: "手写有序数组折半查找，查中间的数没问题，但查找比最大元素还大的 key 时程序彻底卡死！点击导致区间无法缩小的那一行。",
      codeLines: [
        "int binarySearch(int a[], int n, int key) {",
        "    int low = 0, high = n - 1;",
        "    while (low <= high) {",
        "        int mid = low + (high - low) / 2;",
        "        if (a[mid] == key) return mid;",
        "        else if (a[mid] < key) low = mid;",
        "        else high = mid - 1;",
        "    }",
        "    return -1;",
        "}"
      ],
      bugLine: 6,
      choices: [
        "第 3 行：循环条件应该改成 low < high",
        "第 6 行：a[mid] < key 时写成 low = mid 没排除已查过的 mid，当 low == high 或 high == low + 1 时 mid 永远等于 low，陷入死循环",
        "第 4 行：应该写成 (low + high) / 2",
        "第 7 行：应该写成 high = mid"
      ],
      answerIdx: 1,
      explanation: "折半查找死循环 Top 1 病因！既然第 5 行已经确认 a[mid] != key，mid 就必须被排除出下一轮搜索区间！写成 low = mid 时，当 low=4, high=5，mid=4，low 又被赋回 4，永不收敛！必须写成 low = mid + 1。",
      fixCode: "else if (a[mid] < key) low = mid + 1;"
    },
    {
      id: "bug-06-2",
      chapterId: "06",
      title: "BST 删双孩子节点：删完中序遍历多出一个重复值",
      desc: "删除 BST 中同时有左右孩子的根节点 50，用右子树最小节点（中序后继 60）覆盖了 50，结果打印中序遍历出现了两个 60！点击漏掉善后的行。",
      codeLines: [
        "// 已知 root 左右孩子均非空",
        "BSTNode* succ = root->right;",
        "while (succ->left != nullptr) succ = succ->left;",
        "root->key = succ->key;",
        "return root;"
      ],
      bugLine: 5,
      choices: [
        "第 2 行：应该从 root->left 出发找后继",
        "第 3 行：应该写成 while (succ->right != nullptr)",
        "第 5 行：只把后继的值 succ->key 拷贝到了 root，却忘了从右子树中递归删除原本的后继节点 succ，导致树里留下重复值",
        "第 4 行：不能直接修改 root->key"
      ],
      answerIdx: 2,
      explanation: "BST 删除双孩子节点分两步：① 找右子树最小节点 succ，把它的值复制到 root->key；② 必须递归调用 root->right = bstDelete(root->right, succ->key); 把右子树里那个已被“借壳”的替身删掉！忘了第二步就会多出一个幽灵重复节点。",
      fixCode: "root->key = succ->key;\nroot->right = bstDelete(root->right, succ->key);\nreturn root;"
    },
    {
      id: "bug-06-3",
      chapterId: "06",
      title: "散列表插负数：key = -7 时程序瞬间数组越界崩溃",
      desc: "用链地址法手写哈希表，插入正整数全部正常，但只要插入负数 key（例如 -7），立刻段错误崩溃！请点击算出负桶号的那一行。",
      codeLines: [
        "int hashFunc(int key, int tableSize) {",
        "    return key % tableSize;",
        "}",
        "void hashInsert(int key) {",
        "    int idx = hashFunc(key, M);",
        "    buckets[idx].push_back(key);",
        "}"
      ],
      bugLine: 2,
      choices: [
        "第 6 行：vector 不能使用 push_back",
        "第 2 行：C++ 中负数取模结果仍为负数（如 -7 % 11 == -7），导致 buckets[-7] 负下标越界崩溃",
        "第 1 行：散列函数不能接收 int 参数",
        "第 5 行：应该把 M 改成 M - 1"
      ],
      answerIdx: 1,
      explanation: "不同于 Python，C/C++ 的 % 运算符保留被除数的符号！当 key = -7, tableSize = 11 时，-7 % 11 == -7，直接拿去索引 buckets[-7] 立刻崩溃！标准防负取模公式：((key % m) + m) % m。",
      fixCode: "return ((key % tableSize) + tableSize) % tableSize;"
    },

    // ==================== 第 7 章：3 例 ====================
    {
      id: "bug-07-1",
      chapterId: "07",
      title: "快排划分：一遇到全相等数组 [5,5,5,5] 就死循环",
      desc: "手写挖坑法快速排序，随机数组跑得飞快，但一测全相等数组 [5, 5, 5, 5] 程序瞬间卡死超时！点击条件写得太严格的那一行。",
      codeLines: [
        "int partition(int a[], int low, int high) {",
        "    int pivot = a[low];",
        "    while (low < high) {",
        "        while (low < high && a[high] > pivot) high--;",
        "        a[low] = a[high];",
        "        while (low < high && a[low] < pivot) low++;",
        "        a[high] = a[low];",
        "    }",
        "    a[low] = pivot;",
        "    return low;",
        "}"
      ],
      bugLine: 4,
      choices: [
        "第 2 行：不能选 a[low] 作基准",
        "第 4 行（及第 6 行）：内层 while 写了严格 > 和 <，遇到与 pivot 相等的元素时 high 和 low 寸步不移，外层 while (low < high) 彻底死循环",
        "第 9 行：应该把 pivot 放回 a[high + 1]",
        "第 3 行：外层条件应该写成 low <= high"
      ],
      answerIdx: 1,
      explanation: "超级经典快排死循环！当 a[low] == a[high] == pivot（例如 [5,5,5,5]）时，a[high] > pivot 为假、a[low] < pivot 也为假，两个指针永远停在原地互拷 5，外层循环永远结束不了！改为 >= 与 <= 即可确保指针推进。",
      fixCode: "while (low < high && a[high] >= pivot) high--;\na[low] = a[high];\nwhile (low < high && a[low] <= pivot) low++;"
    },
    {
      id: "bug-07-2",
      chapterId: "07",
      title: "堆排序：最大值换到末尾后又被拽回了堆顶！",
      desc: "手写大根堆升序排序，建堆完全正确，但跑完第二阶段的交换与下沉后，结果彻底乱套，最大值居然赖在最前面！点击传错参数的那一行。",
      codeLines: [
        "void heapSort(int a[], int n) {",
        "    for (int i = n / 2 - 1; i >= 0; i--) siftDown(a, n, i);",
        "    for (int i = n - 1; i > 0; i--) {",
        "        swap(a[0], a[i]);",
        "        siftDown(a, n, 0);",
        "    }",
        "}"
      ],
      bugLine: 5,
      choices: [
        "第 2 行：建堆应该从 i = 0 开始往后循环",
        "第 4 行：应该交换 a[0] 和 a[1]",
        "第 5 行：把最大值归位到 a[i] 后，siftDown 第二个参数忘了缩小有效堆大小为 i，仍传了 n，把刚排好的最大值又重新拽回了堆顶",
        "第 3 行：循环应该到 i >= 0"
      ],
      answerIdx: 2,
      explanation: "堆排序每轮把堆顶最大值换到末尾 a[i] 后，a[i..n-1] 就属于已排好序的“禁区”，未排序堆只剩下前 i 个元素 a[0..i-1]！若第 5 行仍传 n，siftDown 会把刚放好的最大值重新挑上来当最大孩子，功亏一篑！",
      fixCode: "siftDown(a, i, 0); // 有效堆长度缩小为 i"
    },
    {
      id: "bug-07-3",
      chapterId: "07",
      title: "归并排序：跑完一遍原数组居然纹丝不动！",
      desc: "手写二路归并的 merge 函数，每一步双指针比较都写得无可挑剔，但整趟 mergeSort 跑完后打印原数组 a，发现顺序根本没变！点击遗漏收尾动作的行。",
      codeLines: [
        "void merge(int a[], int low, int mid, int high, int temp[]) {",
        "    int i = low, j = mid + 1, k = low;",
        "    while (i <= mid && j <= high) {",
        "        temp[k++] = (a[i] <= a[j]) ? a[i++] : a[j++];",
        "    }",
        "    while (i <= mid) temp[k++] = a[i++];",
        "    while (j <= high) temp[k++] = a[j++];",
        "}"
      ],
      bugLine: 8,
      choices: [
        "第 4 行：应该写成 a[i] < a[j]",
        "第 2 行：k 应该初始化为 0",
        "第 8 行：函数结束前忘了把排好序的 temp[low..high] 拷贝回原数组 a[low..high]，导致所有合并成果全部白费",
        "第 6 行：两个剩余元素的 while 循环只能留一个"
      ],
      answerIdx: 2,
      explanation: "归并排序常见失误：辛辛苦苦把左右有序段合并进了辅助数组 temp[low..high]，函数却直接结束了，没有拷回原数组 a！下一层归并读的还是没排过的原数组 a，当然纹丝不动。记得加 for (int t = low; t <= high; t++) a[t] = temp[t];！",
      fixCode: "    for (int t = low; t <= high; t++) {\n        a[t] = temp[t];\n    }\n}"
    }
  ];

  global.__DS_BUG_CASES = bugCases;
})(typeof window !== "undefined" ? window : globalThis);

(function (global) {
  "use strict";

  var flashcards = [
    // ==================== 核心概念 / 公式 / 复杂度 40 张 ====================
    // 第 0 章 (4)
    {
      id: "fc-00-01",
      chapterId: "00",
      category: "核心概念",
      front: "指针（<code>int* p</code>）和引用（<code>int& r</code>）有什么核心区别？",
      back: "<strong>引用 = 别名</strong>：定义时必须初始化、不能为空、绑定后不能改绑。<br/><strong>指针 = 地址变量</strong>：可为 <code>nullptr</code>、可随时改指别处、需用 <code>*</code> 解引用。<br/>修改外部链表头指针时，形参必须写 <strong><code>Node*& head</code></strong>！"
    },
    {
      id: "fc-00-02",
      chapterId: "00",
      category: "核心概念",
      front: "动态内存配对铁律：<code>new</code> / <code>new[]</code> 该如何正确释放？",
      back: "单个对象：<code>new T</code> ⇄ <strong><code>delete p; p = nullptr;</code></strong><br/>动态数组：<code>new T[n]</code> ⇄ <strong><code>delete[] arr; arr = nullptr;</code></strong><br/>释放链表节点必须<strong>先存 <code>nxt = cur->next</code></strong> 再 <code>delete cur</code>，严防 Use-After-Free！"
    },
    {
      id: "fc-00-03",
      chapterId: "00",
      category: "核心概念",
      front: "结构体成员访问何时用点号 <code>.</code>，何时用箭头 <code>-></code>？",
      back: "<strong>对象本身用点号</strong>：<code>node.data</code><br/><strong>结构体指针用箭头</strong>：<code>p->data</code>（等价于 <code>(*p).data</code>）<br/>口诀：手里是盒子打点 <code>.</code>，手里是地址画箭 <code>-></code>！"
    },
    {
      id: "fc-00-04",
      chapterId: "00",
      category: "核心概念",
      front: "写好任何递归函数必须满足哪两个条件？",
      back: "1. <strong>明确的递归出口（Base Case）</strong>，否则无限调用导致栈溢出（Stack Overflow）。<br/>2. <strong>规模收敛</strong>：每次递归必须把问题缩小并逼近出口。"
    },

    // 第 1 章 (4)
    {
      id: "fc-01-01",
      chapterId: "01",
      category: "核心概念",
      front: "数据结构的“三要素”和算法的“五特性”分别是什么？",
      back: "<strong>数据结构三要素</strong>：逻辑结构、存储结构（物理结构）、数据的运算。<br/><strong>算法五特性</strong>：输入（≥0个）、输出（<strong>≥1个</strong>）、有穷性、确定性、可行性。"
    },
    {
      id: "fc-01-02",
      chapterId: "01",
      category: "复杂度与对比",
      front: "常见时间复杂度按增长速度从慢到快（效率从高到低）的完整排序？",
      back: "<code>O(1) &lt; O(log n) &lt; O(n) &lt; O(n log n) &lt; O(n²) &lt; O(n³) &lt; O(2ⁿ) &lt; O(n!)</code><br/><strong>大 O 化简三规则</strong>：只留最高阶、去掉常数系数、默认看最坏情况。"
    },
    {
      id: "fc-01-03",
      chapterId: "01",
      category: "核心概念",
      front: "逻辑结构 vs 存储结构有什么区别？各自有哪些常见类型？",
      back: "<strong>逻辑结构</strong>（抽象关系）：集合、线性（1对1）、树形（1对多）、图形（多对多）。<br/><strong>存储结构</strong>（内存落地）：顺序存储、链式存储（广义还含索引、散列）。"
    },
    {
      id: "fc-01-04",
      chapterId: "01",
      category: "核心概念",
      front: "什么是 NP 问题？它和 P 问题的关系是什么？",
      back: "NP = <strong>Non-deterministic Polynomial（非确定性多项式时间）</strong>，指能在多项式时间内<strong>验证</strong>一个解是否正确的问题。<br/>注意：NP <strong>不是</strong>“非 P 问题”！实际关系是 <strong><code>P ⊆ NP</code></strong>。"
    },

    // 第 2 章 (5)
    {
      id: "fc-02-01",
      chapterId: "02",
      category: "必背公式",
      front: "顺序表地址公式、插入与删除平均移动次数分别是多少？",
      back: "第 i 个元素地址：<code>b + (i - 1) × k</code><br/>等概率<strong>插入</strong>平均移动：<strong><code>n / 2</code></strong><br/>等概率<strong>删除</strong>平均移动：<strong><code>(n - 1) / 2</code></strong><br/>口诀：插入从后往前搬，删除从前往后搬！"
    },
    {
      id: "fc-02-02",
      chapterId: "02",
      category: "必背公式",
      front: "32 位与 64 位环境下，存 <code>int</code> 的顺序表 / 单链表 / 双链表存储密度是多少？",
      back: "公式：<code>存储密度 = 数据域字节数 / 节点总字节数</code><br/>顺序表：<strong>100%</strong><br/>32位(指针4B)：单链表 <strong>50%</strong>，双链表 <strong>33.3%</strong><br/>64位(指针8B)：单链表 <strong>33.3%</strong>，双链表 <strong>20%</strong>"
    },
    {
      id: "fc-02-03",
      chapterId: "02",
      category: "核心概念",
      front: "单链表与双链表插入新节点的“防断链”黄金口诀是什么？",
      back: "<strong>单链表（p 后插 s）</strong>：先接后，再断前 → <code>s->next = p->next; p->next = s;</code><br/><strong>双链表（p 前插 s）</strong>：先连新节点左右，再改原前驱，最后改 <code>p->left</code>！（尾插须先判 <code>p->next != nullptr</code>）"
    },
    {
      id: "fc-02-04",
      chapterId: "02",
      category: "核心概念",
      front: "什么是静态链表？单链表增加“头结点”有什么好处？",
      back: "<strong>静态链表</strong>：用一维结构体数组模拟链表，用整型下标（游标 <code>cur</code>）代替指针，插删无需移动数据。<br/><strong>头结点</strong>：统一空表/非空表、首元/普通节点的插删操作，无需特判修改头指针。"
    },
    {
      id: "fc-02-05",
      chapterId: "02",
      category: "核心概念",
      front: "带头结点的单向循环链表，仅设尾指针 <code>rear</code> 时如何 O(1) 找到头结点与首元结点？",
      back: "尾结点：<code>rear</code><br/>头结点：<strong><code>rear->next</code></strong><br/>首元结点（第 1 个数据节点）：<strong><code>rear->next->next</code></strong><br/>优点：合并两个循环链表、表头表尾插删均可 O(1) 定位！"
    },

    // 第 3 章 (5)
    {
      id: "fc-03-01",
      chapterId: "03",
      category: "必背公式",
      front: "循环队列（少用一个空间）的判空、判满、长度与最大容量公式？",
      back: "队空：<code>front == rear</code><br/>队满：<strong><code>(rear + 1) % maxSize == front</code></strong><br/>元素个数：<strong><code>(rear - front + maxSize) % maxSize</code></strong><br/>最大容量：<code>maxSize - 1</code>"
    },
    {
      id: "fc-03-02",
      chapterId: "03",
      category: "必背公式",
      front: "二维数组按“行优先”存储的地址公式 & n 阶对称矩阵压缩后占多少空间？",
      back: "二维数组：<code>addr(a[i][j]) = 基址 + (i × 列数 + j) × 元素大小</code><br/>n 阶对称矩阵（只存下三角含对角线）：<strong><code>n(n + 1) / 2</code></strong> 个元素。"
    },
    {
      id: "fc-03-03",
      chapterId: "03",
      category: "核心概念",
      front: "KMP 的 <code>next</code> 数组两种常见定义（1-based 教材版 vs 0-based 工程版）有何对应？",
      back: "<strong>教材 1-based</strong>：<code>next[1]=0</code>，<code>next[j] = 前 j-1 字符最长相等真前后缀长 + 1</code>（如 \"abab\" → <code>0,1,1,2</code>）。<br/><strong>工程 0-based</strong>：<code>next[i] = 子串 s[0..i] 最长相等真前后缀长</code>（如 \"ababaca\" → <code>0,0,1,2,3,0,1</code>），失配必须用 <code>while</code> 回退！"
    },
    {
      id: "fc-03-04",
      chapterId: "03",
      category: "核心概念",
      front: "稀疏矩阵的两种经典压缩存储方式是什么？各自适合什么场景？",
      back: "<strong>三元组顺序表</strong> <code>(row, col, val)</code>：节省空间，适合静态矩阵与快速转置。<br/><strong>十字链表</strong>：每节点带右指针与下指针，适合非零元频繁增删的动态稀疏矩阵。"
    },
    {
      id: "fc-03-05",
      chapterId: "03",
      category: "核心概念",
      front: "链栈与链队列的操作端分别选在链表的哪一端才能保证全部 O(1)？",
      back: "<strong>链栈</strong>：表头入栈、表头出栈（头插头删均 O(1)）。<br/><strong>链队列</strong>：设 <code>front</code> 和 <code>rear</code> 双指针，<strong>表尾 <code>rear</code> 入队、表头 <code>front</code> 出队</strong>，均为 O(1)！"
    },

    // 第 4 章 (5)
    {
      id: "fc-04-01",
      chapterId: "04",
      category: "必背公式",
      front: "二叉树最重要的 3 个计数公式（性质 1、2、3）是什么？",
      back: "性质 1：第 i 层最多 <strong><code>2^(i-1)</code></strong> 个节点。<br/>性质 2：深度 h 最多 <strong><code>2^h - 1</code></strong> 个节点。<br/>性质 3 ⭐：<strong><code>n₀ = n₂ + 1</code></strong>（叶子数 = 度为 2 节点数 + 1）。"
    },
    {
      id: "fc-04-02",
      chapterId: "04",
      category: "必背公式",
      front: "完全二叉树的深度公式与层序编号（1-based）父子关系公式（性质 4、5）？",
      back: "深度：<strong><code>⌊log₂n⌋ + 1</code></strong><br/>编号 i 的节点：双亲 = <strong><code>⌊i / 2⌋</code></strong>，左孩子 = <strong><code>2i</code></strong>，右孩子 = <strong><code>2i + 1</code></strong>（超过 n 则无此孩子）。"
    },
    {
      id: "fc-04-03",
      chapterId: "04",
      category: "核心概念",
      front: "二叉树四种遍历（先/中/后/层）的口诀与核心工程用途？",
      back: "<strong>先序（根左右）</strong>：复制树、序列化结构。<br/><strong>中序（左根右）</strong>：<strong>BST 输出严格升序</strong>。<br/><strong>后序（左右根）</strong>：求树高、<strong>安全释放内存（delete）</strong>。<br/><strong>层序（队列）</strong>：BFS、求树宽。"
    },
    {
      id: "fc-04-04",
      chapterId: "04",
      category: "核心概念",
      front: "普通树 / 森林转换为二叉树的“孩子兄弟表示法”口诀？",
      back: "<strong>口诀：左孩右兄！</strong><br/><code>left</code> 指针指向第一个孩子（长子），<code>right</code> 指针指向下一个相邻右兄弟。<br/>森林转二叉树：把各棵树分别转成二叉树，再把后一棵树的根挂在前一棵树根的右指针上。"
    },
    {
      id: "fc-04-05",
      chapterId: "04",
      category: "必背公式",
      front: "哈夫曼树的节点总数公式、WPL 速算秘诀以及度为 1 的节点数？",
      back: "n 个叶子构造的哈夫曼树：总节点数 = <strong><code>2n - 1</code></strong>，度为 1 的节点数 = <strong><code>0</code></strong>。<br/>WPL = <code>Σ(叶权值 × 路径长)</code> = <strong>所有非叶节点权值之和</strong>（考场验算神技！）。"
    },

    // 第 5 章 (5)
    {
      id: "fc-05-01",
      chapterId: "05",
      category: "必背公式",
      front: "图论 3 条必背基本公式（完全图边数 & 握手定理）？",
      back: "无向完全图边数：<strong><code>n(n - 1) / 2</code></strong><br/>有向完全图弧数：<strong><code>n(n - 1)</code></strong><br/>握手定理：<strong>所有顶点度数之和 = 2e</strong>（有向图：入度之和 = 出度之和 = e）。"
    },
    {
      id: "fc-05-02",
      chapterId: "05",
      category: "核心概念",
      front: "有向图邻接矩阵如何快速求某顶点的出度与入度？",
      back: "口诀：<strong>行出列入</strong>！<br/>第 i 行非零元个数 = 顶点 i 的<strong>出度</strong>；<br/>第 i 列非零元个数 = 顶点 i 的<strong>入度</strong>。<br/>无向图邻接矩阵必对称，第 i 行 1 的个数即为度数。"
    },
    {
      id: "fc-05-03",
      chapterId: "05",
      category: "复杂度与对比",
      front: "Dijkstra 与 Floyd 两种最短路径算法的核心对比？",
      back: "<strong>Dijkstra</strong>：单源最短路，朴素 <code>O(n²)</code>（堆优化 <code>O((n+e)log n)</code>），<strong>不支持负权边</strong>。<br/><strong>Floyd</strong>：多源任意两点最短路，<code>O(n³)</code>，支持负权边（无负环），<strong>中转点 k 循环必须在最外层</strong>！"
    },
    {
      id: "fc-05-04",
      chapterId: "05",
      category: "核心概念",
      front: "AOV 网拓扑排序（Kahn 算法）的步骤以及如何判断有向图含环？",
      back: "步骤：① 统计所有顶点入度，将入度为 0 的点入队；② 每次出队输出并把邻居入度减 1，若降为 0 则入队。<br/><strong>判环</strong>：若最终输出顶点数 <strong><code>&lt; n</code></strong>，则图中必存在有向环！"
    },
    {
      id: "fc-05-05",
      chapterId: "05",
      category: "核心概念",
      front: "什么是 AOE 网的“关键路径”与“关键活动”？",
      back: "AOE 网中从源点到汇点<strong>带权路径长度最长</strong>的路径即为关键路径，决定整个工程的<strong>最短完工时间</strong>。<br/>关键活动的时间余量 <code>l(i) - e(i) == 0</code>，任何延迟都会推迟总工期。"
    },

    // 第 6 章 (5)
    {
      id: "fc-06-01",
      chapterId: "06",
      category: "必背公式",
      front: "顺序查找、折半查找的 ASL 与判定树高度公式？",
      back: "顺序查找成功 ASL = <strong><code>(n + 1) / 2</code></strong><br/>折半查找成功 ASL ≈ <strong><code>log₂(n + 1) - 1</code></strong><br/>折半判定树高度（最多比较次数）= <strong><code>⌊log₂n⌋ + 1</code></strong>"
    },
    {
      id: "fc-06-02",
      chapterId: "06",
      category: "核心概念",
      front: "AVL 平衡二叉树的 4 种失衡类型（LL/RR/LR/RL）旋转口诀？",
      back: "<strong>直线型转一次</strong>：LL → <strong>右旋</strong>；RR → <strong>左旋</strong>。<br/><strong>折线型转两次</strong>：LR → <strong>先左旋再右旋</strong>；RL → <strong>先右旋再左旋</strong>。<br/>平衡因子 BF = 左子树高 - 右子树高，合法值 ∈ <code>{-1, 0, 1}</code>。"
    },
    {
      id: "fc-06-03",
      chapterId: "06",
      category: "核心概念",
      front: "BST 删除节点时，按孩子个数分哪 3 种情况处理？",
      back: "1. <strong>叶子节点</strong>：直接释放置空。<br/>2. <strong>单孩子节点</strong>：用唯一孩子顶替它。<br/>3. <strong>双孩子节点</strong>：用<strong>中序后继（右子树最小）</strong>或<strong>中序前驱（左子树最大）</strong>替换值，再递归删掉该替身！"
    },
    {
      id: "fc-06-04",
      chapterId: "06",
      category: "复杂度与对比",
      front: "MySQL 中 InnoDB 与 MyISAM 的 B+ 树索引最大区别是什么？",
      back: "<strong>InnoDB（聚集索引）</strong>：主键树叶子存<strong>整行数据</strong>；辅助索引叶子存主键值，查其他列需<strong>回表</strong>。<br/><strong>MyISAM（非聚集索引）</strong>：索引与数据文件分离，主/辅索引叶子均存数据记录物理地址。"
    },
    {
      id: "fc-06-05",
      chapterId: "06",
      category: "必背公式",
      front: "散列表的装载因子 α 公式、除留余数法质数原则与负数取模防越界写法？",
      back: "装载因子 <strong><code>α = 元素数 / 表长</code></strong>（α 越大冲突越多）。<br/><code>H(key) = key % p</code> 中 <strong>p 取不大于表长的最大质数</strong>。<br/>防负数下标写法：<strong><code>((key % m) + m) % m</code></strong>！"
    },

    // 第 7 章 (4)
    {
      id: "fc-07-01",
      chapterId: "07",
      category: "复杂度与对比",
      front: "十大排序中：哪些时间最好可达 O(n)？哪些空间 O(1)？哪些需 O(n) 空间？",
      back: "<strong>最好 O(n)</strong>：直接插入、冒泡（带提前退出）。<br/><strong>原地空间 O(1)</strong>：插入、希尔、冒泡、选择、堆排（快排递归栈平均 O(log n)）。<br/><strong>需 O(n) 空间</strong>：归并、计数、桶、基数。"
    },
    {
      id: "fc-07-02",
      chapterId: "07",
      category: "核心概念",
      front: "堆排序建堆为什么是 O(n) 而不是 O(n log n)？升序该建大根堆还是小根堆？",
      back: "原地升序排建<strong>大根堆</strong>（每次把最大值换到数组末尾，堆大小缩 1）。<br/>从 <code>n/2 - 1</code> 倒着下沉建堆时，绝大多数节点靠近底层、下沉高度极小，等比级数求和精确为 <strong><code>O(n)</code></strong>！"
    },
    {
      id: "fc-07-03",
      chapterId: "07",
      category: "核心概念",
      front: "什么是“排序的稳定性”？为什么归并排序合并时必须写 <code>a[i] &lt;= a[j]</code>？",
      back: "<strong>稳定性</strong>：排序后相等关键字的原始相对次序保持不变，决定<strong>多关键字排序</strong>结果是否正确。<br/>归并合并时写 <code>&lt;=</code> 才能在两值相等时优先取左半边元素，从而保持稳定！"
    },
    {
      id: "fc-07-04",
      chapterId: "07",
      category: "复杂度与对比",
      front: "非比较排序（计数 / 桶 / 基数）为什么能突破 O(n log n) 下界？它们稳定吗？",
      back: "基于决策树下界定理，比较排序无法快于 <code>Ω(n log n)</code>；计数/桶/基数不靠两两比较，直接利用<strong>值域范围或数位分桶</strong>定位，达到线性时间，且<strong>三者均是稳定排序</strong>！"
    },

    // 附录 A & B (3)
    {
      id: "fc-appA-01",
      chapterId: "appA",
      category: "核心概念",
      front: "C++ 异常处理 <code>try / throw / catch</code> 的三大核心规则是什么？",
      back: "1. <code>throw</code> 一执行立即跳出 <code>try</code> 块，后续语句不执行。<br/>2. <code>catch</code> 严格按<strong>类型匹配</strong>，<code>catch(...)</code> 放最后兜底。<br/>3. 异常会自动沿调用栈向上传播（栈展开）；<strong>切忌在析构函数中抛异常</strong>！"
    },
    {
      id: "fc-appB-01",
      chapterId: "appB",
      category: "核心概念",
      front: "类模板在类外实现成员函数时，必须写全哪三样东西？",
      back: "1. 重新声明模板头：<strong><code>template &lt;class T&gt;</code></strong><br/>2. 返回类型：如 <code>T</code><br/>3. 带模板参数的作用域：<strong><code>SeqList&lt;T&gt;::Get(int i)</code></strong><br/>切记：下标 <code>i</code>、表长 <code>length</code> 依然保持 <code>int</code>，不要盲目改成 <code>T</code>！"
    },
    {
      id: "fc-appB-02",
      chapterId: "appB",
      category: "核心概念",
      front: "为什么 <code>Max(3, 2.5)</code> 在函数模板 <code>template&lt;class T&gt; T Max(T, T)</code> 中会编译报错？",
      back: "函数模板自动类型推导<strong>不进行隐式类型转换</strong>！<code>3</code> 是 <code>int</code>，<code>2.5</code> 是 <code>double</code>，编译器无法同时让 <code>T</code> 等于两种类型。<br/>解决：显式指定 <strong><code>Max&lt;double&gt;(3, 2.5)</code></strong>。"
    },

    // ==================== 面试高频 20 问（严格对齐 速查表.md） ====================
    {
      id: "fc-iv-01",
      chapterId: "02",
      category: "面试高频20问",
      front: "【面试 #1】顺序表和链表各自的优缺点？什么场景用哪个？",
      back: "<strong>顺序表</strong>：按位查 <code>O(1)</code>（缓存命中高）、存储密度 100%，但插删需搬移 <code>O(n)</code>、扩容拷贝成本高 → 适合<strong>查询多、修改少、长度较稳定</strong>。<br/><strong>链表</strong>：已知位置插删 <code>O(1)</code>、动态按需分配，但按位查 <code>O(n)</code>、额外指针开销 → 适合<strong>频繁插删、规模变化剧烈</strong>。"
    },
    {
      id: "fc-iv-02",
      chapterId: "02",
      category: "面试高频20问",
      front: "【面试 #2】单链表如何原地反转（O(n) 时间，O(1) 空间）？",
      back: "使用三指针 <code>prev = nullptr, curr = head</code>：<br/>循环内四步：<code>nxt = curr->next;</code>（备份）→ <code>curr->next = prev;</code>（掉头）→ <code>prev = curr;</code> → <code>curr = nxt;</code>。<br/>循环结束时 <code>prev</code> 即为新表头！"
    },
    {
      id: "fc-iv-03",
      chapterId: "02",
      category: "面试高频20问",
      front: "【面试 #3】如何判断单链表是否有环？进阶：如何找环入口？",
      back: "<strong>Floyd 快慢指针</strong>：<code>slow</code> 走 1 步、<code>fast</code> 走 2 步，若相遇则有环，<code>fast</code> 先到空则无环（空间 O(1)）。<br/><strong>找环入口</strong>：相遇后让一个指针回到 <code>head</code>，两指针每次各走 1 步，再次相遇点必是环入口！"
    },
    {
      id: "fc-iv-04",
      chapterId: "03",
      category: "面试高频20问",
      front: "【面试 #4】栈和队列的区别是什么？各举至少 2 个典型应用。",
      back: "<strong>栈（LIFO 后进先出）</strong>：只在一端（栈顶）操作。应用：括号匹配、表达式求值、函数递归调用栈、浏览器后退/撤销。<br/><strong>队列（FIFO 先进先出）</strong>：队尾进、队头出。应用：BFS 广度优先遍历、操作系统任务调度、消息缓冲队列。"
    },
    {
      id: "fc-iv-05",
      chapterId: "03",
      category: "面试高频20问",
      front: "【面试 #5】循环队列如何区分“队空”和“队满”？",
      back: "三种主流方案（教材主推第 1 种）：<br/>1. <strong>少用一个空间</strong>：空 <code>front == rear</code>，满 <code>(rear + 1) % maxSize == front</code>；<br/>2. 增设计数变量 <code>size</code>（0 为空，maxSize 为满）；<br/>3. 增设标志位 <code>tag</code> 记录最近一次是入队还是出队。"
    },
    {
      id: "fc-iv-06",
      chapterId: "03",
      category: "面试高频20问",
      front: "【面试 #6】KMP 算法为什么比 BF（暴力匹配）快？复杂度是多少？",
      back: "BF 失配时主串指针 <code>i</code> 回退重头比，最坏 <strong><code>O(n × m)</code></strong>；<br/>KMP 预处理模式串得到 <code>next</code>（最长相等真前后缀）数组，失配时<strong>主串 <code>i</code> 永不回退</strong>，只跳跃模式串 <code>j</code>，总复杂度降至 <strong><code>O(n + m)</code></strong>！"
    },
    {
      id: "fc-iv-07",
      chapterId: "04",
      category: "面试高频20问",
      front: "【面试 #7】二叉树最重要的 5 条性质是什么？",
      back: "① 第 i 层最多 <code>2^(i-1)</code>；<br/>② 深度 h 最多 <code>2^h - 1</code>；<br/>③ <strong><code>n₀ = n₂ + 1</code></strong>；<br/>④ n 节点完全二叉树深度 <code>⌊log₂n⌋ + 1</code>；<br/>⑤ 完全二叉树编号 i：父 <code>⌊i/2⌋</code>、左 <code>2i</code>、右 <code>2i+1</code>。"
    },
    {
      id: "fc-iv-08",
      chapterId: "04",
      category: "面试高频20问",
      front: "【面试 #8】已知二叉树的前序和中序遍历，如何求后序遍历？",
      back: "① <strong>前序首元素</strong>即为当前子树根节点；<br/>② 在<strong>中序</strong>中找到该根，左边即左子树，右边即右子树；<br/>③ 根据左右子树节点数切分前序，递归还原左右子树；<br/>④ 最后按<strong>左 → 右 → 根</strong>输出即得后序！（注：前序+后序无法唯一确定）"
    },
    {
      id: "fc-iv-09",
      chapterId: "04",
      category: "面试高频20问",
      front: "【面试 #9】完全二叉树为什么适合用一维数组顺序存储？",
      back: "完全二叉树除了最后一层外全满、且最后一层紧贴左侧，按层序编号放入数组时<strong>没有任何空洞浪费空间</strong>；并且任意节点 <code>i</code> 的父子下标直接通过 <code>i/2</code>、<code>2i</code>、<code>2i+1</code> <strong>O(1) 算出来</strong>，连指针都省了（堆排序正是利用这一点）！"
    },
    {
      id: "fc-iv-10",
      chapterId: "04",
      category: "面试高频20问",
      front: "【面试 #10】哈夫曼树怎么构造？为什么它能实现无损数据压缩？",
      back: "<strong>构造</strong>：贪心思想——每次从森林选<strong>权值最小的两棵树</strong>合并为新父节点，重复 n-1 次。<br/><strong>压缩原理</strong>：高频字符离根近（编码短）、低频字符离根远（编码长），使 WPL 最小；且所有字符都在叶子上，形成<strong>无二义前缀码</strong>，可 100% 无损还原！"
    },
    {
      id: "fc-iv-11",
      chapterId: "05",
      category: "面试高频20问",
      front: "【面试 #11】图的邻接矩阵和邻接表怎么选？",
      back: "<strong>邻接矩阵</strong>：空间 <code>O(n²)</code>，查两点是否有边 <code>O(1)</code> → 适合<strong>顶点数少或边很密的稠密图</strong>。<br/><strong>邻接表</strong>：空间 <code>O(n + e)</code>，遍历某点所有邻居 <code>O(度)</code> → 适合<strong>边远少于 n² 的稀疏图</strong>（现实中社交/地图网络绝大多数是稀疏图）。"
    },
    {
      id: "fc-iv-12",
      chapterId: "05",
      category: "面试高频20问",
      front: "【面试 #12】DFS 和 BFS 的核心区别是什么？各用什么数据结构？",
      back: "<strong>DFS（深度优先）</strong>：用<strong>栈/递归</strong>，一条路撞南墙再回溯，适合拓扑排序、找连通分量、回溯搜路径。<br/><strong>BFS（广度优先）</strong>：用<strong>队列</strong>，按层由近及远扩散，<strong>适合求无权图最短路径</strong>（切记入队即标 <code>visited</code>！）。"
    },
    {
      id: "fc-iv-13",
      chapterId: "05",
      category: "面试高频20问",
      front: "【面试 #13】最小生成树的 Prim 算法和 Kruskal 算法有什么区别？",
      back: "<strong>Prim（加点法）</strong>：从某点出发，每次挑离当前生成树最近的未访问顶点加入，朴素 <code>O(n²)</code> → 适合<strong>稠密图</strong>。<br/><strong>Kruskal（加边法）</strong>：所有边按权升序排序，依次挑不成环的最小边（用<strong>并查集</strong>判环），<code>O(e log e)</code> → 适合<strong>稀疏图</strong>。"
    },
    {
      id: "fc-iv-14",
      chapterId: "05",
      category: "面试高频20问",
      front: "【面试 #14】为什么 Dijkstra 算法不能处理带负权边的图？",
      back: "Dijkstra 采用贪心策略：每次选出未确定点中 <code>dist[u]</code> 最小的点，就认为它的最短路已经“永久锁定”不会再变短。但若存在<strong>负权边</strong>，后续可能从更远的点经由负权边绕回来使 <code>dist[u]</code> 变得更小，导致贪心结论失效！（含负权边应换 Bellman-Ford / SPFA / Floyd）"
    },
    {
      id: "fc-iv-15",
      chapterId: "06",
      category: "面试高频20问",
      front: "【面试 #15】折半查找（二分查找）的前提条件是什么？时间复杂度是多少？",
      back: "必须同时满足两大前提：① <strong>关键字有序</strong>；② <strong>顺序存储结构（数组）</strong>，以支持 <code>O(1)</code> 定位中点 <code>mid</code>。<br/>时间复杂度 <strong><code>O(log₂n)</code></strong>，代码注意 <code>mid = low + (high-low)/2</code> 防溢出与 <code>low = mid + 1 / high = mid - 1</code> 防死循环！"
    },
    {
      id: "fc-iv-16",
      chapterId: "06",
      category: "面试高频20问",
      front: "【面试 #16】二叉排序树（BST）为什么会退化？怎么解决？",
      back: "当插入数据本身<strong>有序或近乎有序</strong>时，BST 会退化成一条单边斜树（等价于单链表），树高变为 <code>n</code>，查找从 <code>O(log n)</code> 退化为 <strong><code>O(n)</code></strong>！<br/><strong>解决</strong>：改用自平衡搜索树——<strong>AVL 树</strong>（严格高度平衡，旋转调整）或<strong>红黑树</strong>（近似平衡，STL <code>map/set</code> 底层）。"
    },
    {
      id: "fc-iv-17",
      chapterId: "06",
      category: "面试高频20问",
      front: "【面试 #17】为什么数据库（如 MySQL InnoDB）索引选 B+ 树而不是二叉树 / 哈希表？",
      back: "① 相比二叉树：B+ 树多路矮胖，千万数据仅 3~4 层，极大减少昂贵的<strong>磁盘 I/O</strong>；非叶节点不存整行数据，单页能装更多索引。<br/>② 相比哈希表：B+ 树叶子用双向链表有序串联，天然支持<strong>范围查询（BETWEEN / &gt; / &lt;）、排序与最左前缀匹配</strong>！"
    },
    {
      id: "fc-iv-18",
      chapterId: "06",
      category: "面试高频20问",
      front: "【面试 #18】散列表（哈希表）发生哈希冲突有哪些经典解决方法？",
      back: "1. <strong>开放定址法</strong>（线性探测、二次探测、双重散列）：冲突时按探测序列找下一个空槽；易产生“堆积”，删除需打墓碑标记。<br/>2. <strong>链地址法（拉链法）</strong>：同槽冲突元素挂成链表（Java HashMap 过长还会转红黑树）；不堆积、删除方便、支持高装载因子！"
    },
    {
      id: "fc-iv-19",
      chapterId: "07",
      category: "面试高频20问",
      front: "【面试 #19】哪些排序是稳定的？哪些排序在最坏情况下依然是 O(n log n)？",
      back: "<strong>稳定排序</strong>：直接插入、冒泡、归并（+ 非比较的计数、桶、基数）。<br/><strong>不稳定排序</strong>：<strong>快、选、堆、希</strong>（“快些选一堆”）。<br/><strong>最坏仍保 O(n log n)</strong>：<strong>堆排序</strong>（空间 O(1)）和 <strong>归并排序</strong>（稳定，空间 O(n)）！"
    },
    {
      id: "fc-iv-20",
      chapterId: "07",
      category: "面试高频20问",
      front: "【面试 #20】快速排序什么情况下会退化为 O(n²)？工程上如何优化避免？",
      back: "<strong>退化场景</strong>：序列已经有序/逆序（或大量重复元素）且固定选端元素作基准，导致每次划分极度倾斜（0 vs n-1），递归深达 <code>n</code> 层。<br/><strong>优化</strong>：① 随机选基准 / <strong>三数取中</strong>；② 重复元素多时用<strong>三路快排</strong>；③ 小区间切换为直接插入排序（C++ <code>std::sort</code> 的 Introsort 还会切堆排保底）。"
    }
  ];

  global.DS_QUIZZES = {
    questions: global.__DS_Q_ALL || [],
    bugCases: global.__DS_BUG_CASES || [],
    flashcards: flashcards
  };
  delete global.__DS_Q_ALL;
  delete global.__DS_BUG_CASES;
})(typeof window !== "undefined" ? window : globalThis);
