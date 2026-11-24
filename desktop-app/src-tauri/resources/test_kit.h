#ifndef DS_LAB_TEST_KIT_H
#define DS_LAB_TEST_KIT_H

#include <iostream>
#include <sstream>
#include <string>
#include <vector>
#include <stdexcept>

namespace labtest {

struct Stats {
    int passed = 0;
    int failed = 0;
    std::string labTitle;
};

inline Stats& stats() {
    static Stats s;
    return s;
}

inline void beginLab(const std::string& title) {
    stats().passed = 0;
    stats().failed = 0;
    stats().labTitle = title;
    std::cout << "================================================\n";
    std::cout << "  " << title << "\n";
    std::cout << "================================================\n";
}

inline std::string vecToStr(const std::vector<int>& v) {
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) oss << ", ";
        oss << v[i];
    }
    oss << "]";
    return oss.str();
}

inline std::string strVecToStr(const std::vector<std::string>& v) {
    std::ostringstream oss;
    oss << "[";
    for (size_t i = 0; i < v.size(); ++i) {
        if (i > 0) oss << ", ";
        oss << "\"" << v[i] << "\"";
    }
    oss << "]";
    return oss.str();
}

inline void reportPass(const std::string& name) {
    stats().passed++;
    std::cout << "[PASS] " << name << "\n";
}

inline void reportFail(const std::string& name,
                       const std::string& expected,
                       const std::string& actual,
                       const std::string& hint) {
    stats().failed++;
    std::cout << "[FAIL] " << name << "\n";
    std::cout << "       期望: " << expected << "\n";
    std::cout << "       实际: " << actual << "\n";
    if (!hint.empty()) {
        std::cout << "       排查提示: " << hint << "\n";
    }
}

inline void expectTrue(const std::string& name, bool cond, const std::string& hint = "") {
    if (cond) {
        reportPass(name);
    } else {
        reportFail(name, "true", "false", hint);
    }
}

inline void expectEqInt(const std::string& name, int expected, int actual, const std::string& hint = "") {
    if (expected == actual) {
        reportPass(name);
    } else {
        reportFail(name, std::to_string(expected), std::to_string(actual), hint);
    }
}

inline void expectEqStr(const std::string& name, const std::string& expected, const std::string& actual, const std::string& hint = "") {
    if (expected == actual) {
        reportPass(name);
    } else {
        reportFail(name, "\"" + expected + "\"", "\"" + actual + "\"", hint);
    }
}

inline void expectEqVec(const std::string& name,
                        const std::vector<int>& expected,
                        const std::vector<int>& actual,
                        const std::string& hint = "") {
    if (expected == actual) {
        reportPass(name);
    } else {
        reportFail(name, vecToStr(expected), vecToStr(actual), hint);
    }
}

inline int endLab() {
    int total = stats().passed + stats().failed;
    std::cout << "------------------------------------------------\n";
    std::cout << "总计: " << stats().passed << " / " << total << " 通过";
    if (stats().failed == 0 && total > 0) {
        std::cout << "  >>> 恭喜！本关全部通过！ <<<\n";
        return 0;
    } else {
        std::cout << "  (还有 " << stats().failed << " 项未通过，请按提示排查)\n";
        return 1;
    }
}

} // namespace labtest

#endif // DS_LAB_TEST_KIT_H
