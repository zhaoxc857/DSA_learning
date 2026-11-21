// ============================================================
// 附录_异常处理.cpp
// 配套笔记：附录A 异常处理
//
// 内容：throw / try / catch 的完整演示
//       1. 最小示例（除零）
//       2. 异常自动向上传播
//       3. 数据结构中的实际用法
//       4. 多类型 catch
//       5. 标准异常类
//       6. 常见误区演示
//
// 编译运行：
//   g++ -std=c++11 附录_异常处理.cpp -o demo && ./demo
// ============================================================

#include <iostream>
#include <string>
#include <stdexcept>
#include <vector>
using namespace std;

// ============================================================
// 一、最小示例：除零检查
// ============================================================
int divide(int a, int b) {
    if (b == 0) {
        throw "除数不能为 0";      // 抛出异常
    }
    return a / b;
}

void demo1() {
    cout << "【演示1】最小示例：除零检查" << endl;
    cout << "----------------------------------------" << endl;

    try {
        cout << "  10 / 2 = " << divide(10, 2) << endl;
        cout << "  接下来算 10 / 0（会抛异常）" << endl;
        int r = divide(10, 0);          // 先算出结果，避免输出粘连
        cout << "  10 / 0 = " << r << endl;   // 这行不会执行
    }
    catch (const char* msg) {
        cout << "  捕获到异常：" << msg << endl;
    }

    cout << "  程序继续执行 ✓" << endl << endl;
}

// ============================================================
// 二、异常自动向上传播
// ============================================================
void C() {
    cout << "    [C] 准备抛异常" << endl;
    throw "C 出错了";
    cout << "    [C] 这行不会执行" << endl;
}

void B() {
    cout << "    [B] 调用 C，但我不处理异常" << endl;
    C();                                  // 不 try，异常自动向上传
    cout << "    [B] 这行不会执行" << endl;
}

void A() {
    cout << "    [A] 调用 B，我也不处理" << endl;
    B();
    cout << "    [A] 这行不会执行" << endl;
}

void demo2() {
    cout << "【演示2】异常自动向上传播" << endl;
    cout << "----------------------------------------" << endl;
    cout << "  调用链：main → A() → B() → C()" << endl;
    cout << "  异常在 C 抛出，A 和 B 都不处理" << endl << endl;

    try {
        A();
    }
    catch (const char* msg) {
        cout << "    [main] 在 main 里捕获：" << msg << endl;
    }
    cout << "  → 异常穿过 B、A 两层，被 main 接住 ✓" << endl << endl;
}

// ============================================================
// 三、数据结构中的实际用法
// ============================================================
template <class T>
class SeqList {
private:
    T*  data;
    int maxSize;
    int length;

public:
    SeqList(int size = 5) {
        maxSize = size;
        data = new T[maxSize];
        length = 0;
    }
    ~SeqList() { delete[] data; }

    bool isFull() const { return length == maxSize; }
    int  size() const { return length; }

    // 插入：所有可能出错的地方都 throw
    void Insert(int i, T x) {
        if (length == maxSize) {
            throw "表已满，无法插入";
        }
        if (i < 1 || i > length + 1) {
            throw "插入位置非法";
        }
        for (int j = length; j >= i; j--) {
            data[j] = data[j - 1];
        }
        data[i - 1] = x;
        length++;
    }

    // 查找
    T Get(int i) {
        if (i < 1 || i > length) {
            throw "查找位置非法";
        }
        return data[i - 1];
    }

    // 删除
    T Delete(int i) {
        if (i < 1 || i > length) {
            throw "删除位置非法";
        }
        T x = data[i - 1];
        for (int j = i - 1; j < length - 1; j++) {
            data[j] = data[j + 1];
        }
        length--;
        return x;
    }

    void print() const {
        cout << "    [";
        for (int i = 0; i < length; i++) {
            cout << data[i];
            if (i < length - 1) cout << ", ";
        }
        cout << "]" << endl;
    }
};

void demo3() {
    cout << "【演示3】顺序表中的异常处理" << endl;
    cout << "----------------------------------------" << endl;

    SeqList<int> list(5);      // 容量 5

    // 正常插入
    cout << "  插入 10, 20, 30（正常）：" << endl;
    try {
        list.Insert(1, 10);
        list.Insert(2, 20);
        list.Insert(3, 30);
        list.print();
    } catch (const char* msg) {
        cout << "  失败：" << msg << endl;
    }

    // 位置越界（表还没满，所以报的是"位置非法"）
    cout << "  插入到位置 100（越界，表未满）：" << endl;
    try {
        list.Insert(100, 99);
    } catch (const char* msg) {
        cout << "    捕获：" << msg << endl;
    }

    // 查找越界
    cout << "  查找第 10 个元素（越界）：" << endl;
    try {
        int x = list.Get(10);
        cout << "    找到：" << x << endl;
    } catch (const char* msg) {
        cout << "    捕获：" << msg << endl;
    }

    // 表已满（把表填满后再插）
    cout << "  把表填满，再插入一个（表已满）：" << endl;
    try {
        list.Insert(4, 40);
        list.Insert(5, 50);
        list.print();
        list.Insert(6, 60);        // 此时表满（容量 5）
    } catch (const char* msg) {
        cout << "    捕获：" << msg << endl;
    }

    cout << "  → 每次出错都被拦住，程序没有崩溃 ✓" << endl << endl;
}

// ============================================================
// 四、捕获不同类型
// ============================================================
void mayThrow(int type) {
    if (type == 1) throw 42;                    // int
    if (type == 2) throw "字符串错误";           // const char*
    if (type == 3) throw string("string 错误");  // std::string
    throw 3.14;                                  // double（会被 catch(...) 接住）
}

void demo4() {
    cout << "【演示4】捕获不同类型的异常" << endl;
    cout << "----------------------------------------" << endl;

    for (int t = 1; t <= 4; t++) {
        cout << "  抛出类型 " << t << "：";
        try {
            mayThrow(t);
        }
        catch (int code) {
            cout << "被 catch(int) 捕获，值 = " << code << endl;
        }
        catch (const char* msg) {
            cout << "被 catch(const char*) 捕获：" << msg << endl;
        }
        catch (const string& msg) {
            cout << "被 catch(string) 捕获：" << msg << endl;
        }
        catch (...) {                    // 万能捕获，必须放最后
            cout << "被 catch(...) 捕获（未知类型）" << endl;
        }
    }
    cout << "  → catch 按类型匹配，(...) 兜底 ✓" << endl << endl;
}

// ============================================================
// 五、标准异常类
// ============================================================
void demo5() {
    cout << "【演示5】标准异常类（更专业的做法）" << endl;
    cout << "----------------------------------------" << endl;

    // 5.1 out_of_range
    cout << "  out_of_range（越界）：" << endl;
    try {
        vector<int> v = {1, 2, 3};
        int val = v.at(10);              // 先求值，避免输出粘连
        cout << "    v.at(10) = " << val << endl;
    }
    catch (const std::exception& e) {                   // 基类引用接住
        cout << "    捕获：" << e.what() << endl;
    }

    // 5.2 invalid_argument
    cout << "  invalid_argument（参数非法）：" << endl;
    try {
        throw std::invalid_argument("参数必须是正数");
    }
    catch (const std::exception& e) {
        cout << "    捕获：" << e.what() << endl;
    }

    // 5.3 自定义检查
    cout << "  自定义的越界检查：" << endl;
    try {
        int i = 100;
        if (i < 0 || i >= 3) {
            throw std::out_of_range("索引 " + to_string(i) + " 超出范围");
        }
    }
    catch (const std::exception& e) {
        cout << "    捕获：" << e.what() << endl;
    }

    cout << "  → 标准异常类自带 what() 说明，比裸字符串规范 ✓" << endl << endl;
}

// ============================================================
// 六、常见误区演示
// ============================================================
void demo6() {
    cout << "【演示6】常见误区对比" << endl;
    cout << "----------------------------------------" << endl;

    // 误区3：用异常做流程控制（反面教材）
    cout << "  误区：用异常判断'表是否满'" << endl;
    cout << "    （异常很慢，不该当 if 用）" << endl;

    SeqList<int> list(2);
    list.Insert(1, 1);
    list.Insert(2, 2);

    // 错误做法
    try {
        list.Insert(1, 3);
    } catch (const char*) {
        cout << "    用异常检测到'表满'——不推荐" << endl;
    }

    // 正确做法
    if (list.isFull()) {
        cout << "    用 isFull() 判断——推荐 ✓" << endl;
    }

    cout << endl;
    cout << "  → 原则：正常情况用 if 判断，异常只留给真正的意外" << endl << endl;
}

// ============================================================
// 主函数
// ============================================================
int main() {
    cout << "========================================" << endl;
    cout << "  异常处理（throw / try / catch）演示" << endl;
    cout << "========================================" << endl << endl;

    demo1();
    demo2();
    demo3();
    demo4();
    demo5();
    demo6();

    cout << "========================================" << endl;
    cout << "  核心要点：" << endl;
    cout << "  1. throw 抛出，try 尝试，catch 捕获" << endl;
    cout << "  2. throw 之后的代码不执行" << endl;
    cout << "  3. 异常会自动向上传播，直到被捕获" << endl;
    cout << "  4. catch 按类型匹配，(...) 兜底放最后" << endl;
    cout << "  5. try 要精确、catch 要处理、别当 if 用" << endl;
    cout << "========================================" << endl;

    return 0;
}
