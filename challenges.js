/**
 * Three divisions: Python, C, Java.
 * Each division has chapters (levels): datatypes → operators → conditionals/loops as fits.
 * Challenge shape: id, title, description, question, expectedAnswer, acceptableAnswers, exp, points
 */
window.CODE_ARENA_COURSE = {
  divisions: [
    {
      id: "python",
      name: "Python",
      tagline: "Basics from types to loops",
      chapters: [
        {
          id: "py-l1",
          level: 1,
          title: "Datatypes & literals",
          blurb: "Types, values, and truthiness",
          challenges: [
            {
              id: "py-type-float",
              title: "Name of the datatype",
              description: "Level 1 · Datatypes",
              question: `In Python, what is the name of the type of the value \`3.14\`? (one word, lowercase)`,
              expectedAnswer: "float",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "py-type-int-lit",
              title: "Type of an integer literal",
              description: "Level 1 · Datatypes",
              question: `What is the name of the type of the value \`42\` in Python? (one word, lowercase)`,
              expectedAnswer: "int",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "py-len-string",
              title: "len of a string",
              description: "Level 1 · Datatypes",
              question: `What does this print?

\`\`\`python
print(len("hi"))
\`\`\``,
              expectedAnswer: "2",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "py-bool-empty",
              title: "Truthiness of an empty list",
              description: "Level 1 · Datatypes",
              question: `What does this print? (capitalize like Python's \`bool\` display)

\`\`\`python
print(bool([]))
\`\`\``,
              expectedAnswer: "False",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
          ],
        },
        {
          id: "py-l2",
          level: 2,
          title: "Operators",
          blurb: "Arithmetic and string operations",
          challenges: [
            {
              id: "py-int-div",
              title: "Floor division",
              description: "Level 2 · Operators",
              question: `What does this print?

\`\`\`python
print(10 // 3)
\`\`\``,
              expectedAnswer: "3",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "py-str-repeat",
              title: "String repetition",
              description: "Level 2 · Operators",
              question: `Exact output (one line, no extra spaces):

\`\`\`python
print("xo" * 2)
\`\`\``,
              expectedAnswer: "xoxo",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "py-pow-op",
              title: "Exponentiation",
              description: "Level 2 · Operators",
              question: `What does this print?

\`\`\`python
print(2 ** 3)
\`\`\``,
              expectedAnswer: "8",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
          ],
        },
        {
          id: "py-l3",
          level: 3,
          title: "Loops & iteration",
          blurb: "range, for, and while",
          challenges: [
            {
              id: "py-range-list",
              title: "range and list",
              description: "Level 3 · Loops",
              question: `What does this print?

\`\`\`python
print(list(range(3)))
\`\`\`

Use Python's usual list formatting (spaces after commas).`,
              expectedAnswer: "[0, 1, 2]",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "py-for-print",
              title: "for loop output",
              description: "Level 3 · Loops",
              question: `What is the **exact output** (each \`print\` adds a newline)?

\`\`\`python
for i in range(2):
    print(i)
\`\`\``,
              expectedAnswer: "0\n1",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "py-while-print",
              title: "while loop",
              description: "Level 3 · Loops",
              question: `Exact output:

\`\`\`python
n = 0
while n < 2:
    print(n)
    n += 1
\`\`\``,
              expectedAnswer: "0\n1",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
          ],
        },
        {
          id: "py-l4",
          level: 4,
          title: "Conditionals",
          blurb: "if, elif, else (Python uses these instead of a switch)",
          challenges: [
            {
              id: "py-if-elif",
              title: "if / elif / else",
              description: "Level 4 · Conditionals",
              question: `Exact output (one line):

\`\`\`python
x = 5
if x < 3:
    print("lo")
elif x < 10:
    print("mid")
else:
    print("hi")
\`\`\``,
              expectedAnswer: "mid",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "py-if-else-compare",
              title: "if / else comparison",
              description: "Level 4 · Conditionals",
              question: `What is printed?

\`\`\`python
a = 2
b = 3
if a > b:
    print("x")
else:
    print("y")
\`\`\``,
              expectedAnswer: "y",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "py-if-empty-list",
              title: "if with a list condition",
              description: "Level 4 · Conditionals",
              question: `Empty lists are falsy in Python. Exact output:

\`\`\`python
if []:
    print("yes")
else:
    print("no")
\`\`\``,
              expectedAnswer: "no",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
          ],
        },
      ],
    },
    {
      id: "c",
      name: "C",
      tagline: "Basics from types to loops",
      chapters: [
        {
          id: "c-l1",
          level: 1,
          title: "Datatypes & characters",
          blurb: "char and numeric representation",
          challenges: [
            {
              id: "c-char-ascii",
              title: "char printed as integer",
              description: "Level 1 · Datatypes",
              question: `What is printed? (\`%d\` prints the numeric value of the character)

\`\`\`c
char c = 'A';
printf("%d", c);
\`\`\``,
              expectedAnswer: "65",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "c-char-digit-zero",
              title: "Digit character as int",
              description: "Level 1 · Datatypes",
              question: `What is printed? (\`%d\` prints the numeric value of the character)

\`\`\`c
char c = '0';
printf("%d", c);
\`\`\``,
              expectedAnswer: "48",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "c-sizeof-char",
              title: "sizeof(char)",
              description: "Level 1 · Datatypes",
              question: `What is printed? (on typical platforms \`sizeof(char)\` is 1)

\`\`\`c
printf("%d", (int)sizeof(char));
\`\`\``,
              expectedAnswer: "1",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
          ],
        },
        {
          id: "c-l2",
          level: 2,
          title: "Operators",
          blurb: "Modulo, division, increment",
          challenges: [
            {
              id: "c-modulo",
              title: "Modulo",
              description: "Level 2 · Operators",
              question: `Assume \`#include <stdio.h>\` and \`main\` runs this. What is printed? (no newline from \`printf\` here)

\`\`\`c
printf("%d", 10 % 3);
\`\`\``,
              expectedAnswer: "1",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "c-int-div",
              title: "Integer division",
              description: "Level 2 · Operators",
              question: `What is printed?

\`\`\`c
printf("%d", 7 / 2);
\`\`\``,
              expectedAnswer: "3",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "c-postfix",
              title: "Postfix increment",
              description: "Level 2 · Operators",
              question: `What is printed in total by both calls (no spaces, no newlines)?

\`\`\`c
int x = 5;
printf("%d", x++);
printf("%d", x);
\`\`\``,
              expectedAnswer: "56",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
          ],
        },
        {
          id: "c-l3",
          level: 3,
          title: "Conditionals",
          blurb: "if / else control flow",
          challenges: [
            {
              id: "c-if-else",
              title: "if / else",
              description: "Level 3 · Conditionals",
              question: `What is printed?

\`\`\`c
int a = 3;
if (a == 3)
    printf("ok");
else
    printf("no");
\`\`\``,
              expectedAnswer: "ok",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "c-if-elif",
              title: "if / else if / else",
              description: "Level 3 · Conditionals",
              question: `What is printed?

\`\`\`c
int x = 15;
if (x < 10)
    printf("A");
else if (x < 20)
    printf("B");
else
    printf("C");
\`\`\``,
              expectedAnswer: "B",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "c-switch-case",
              title: "switch — matching case",
              description: "Level 3 · Conditionals",
              question: `Assume \`#include <stdio.h>\`. What is printed? (no newline)

\`\`\`c
int k = 2;
switch (k) {
    case 1: printf("1"); break;
    case 2: printf("2"); break;
    default: printf("d");
}
\`\`\``,
              expectedAnswer: "2",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "c-switch-default",
              title: "switch — default branch",
              description: "Level 3 · Conditionals",
              question: `What is printed?

\`\`\`c
int k = 99;
switch (k) {
    case 1: printf("a"); break;
    case 2: printf("b"); break;
    default: printf("z"); break;
}
\`\`\``,
              expectedAnswer: "z",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "c-switch-fallthrough",
              title: "switch — fall-through (no break)",
              description: "Level 3 · Conditionals",
              question: `When a \`case\` runs and there is no \`break\`, execution continues into the next \`case\`. What is printed?

\`\`\`c
int k = 1;
switch (k) {
    case 1:
        printf("x");
    case 2:
        printf("y");
        break;
    default:
        printf("z");
}
\`\`\``,
              expectedAnswer: "xy",
              acceptableAnswers: [],
              exp: 14,
              points: 7,
            },
          ],
        },
        {
          id: "c-l4",
          level: 4,
          title: "Loops",
          blurb: "for and while",
          challenges: [
            {
              id: "c-for-loop",
              title: "for loop",
              description: "Level 4 · Loops",
              question: `What is printed? (digits only, no separators)

\`\`\`c
for (int i = 0; i < 3; i++)
    printf("%d", i);
\`\`\``,
              expectedAnswer: "012",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "c-while-loop",
              title: "while loop",
              description: "Level 4 · Loops",
              question: `What is printed? (digits only)

\`\`\`c
int n = 0;
while (n < 2) {
    printf("%d", n);
    n++;
}
\`\`\``,
              expectedAnswer: "01",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "c-dowhile-print",
              title: "do-while loop",
              description: "Level 4 · Loops",
              question: `What is printed? (digits only, no newlines)

\`\`\`c
int n = 0;
do {
    printf("%d", n);
    n++;
} while (n < 2);
\`\`\``,
              expectedAnswer: "01",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
          ],
        },
      ],
    },
    {
      id: "java",
      name: "Java",
      tagline: "Basics from types to loops",
      chapters: [
        {
          id: "java-l1",
          level: 1,
          title: "Datatypes & arrays",
          blurb: "Primitives, booleans, array length",
          challenges: [
            {
              id: "java-double-div",
              title: "Floating-point division",
              description: "Level 1 · Datatypes",
              question: `What does this print?

\`\`\`java
System.out.println(9.0 / 4);
\`\`\``,
              expectedAnswer: "2.5",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "java-boolean-print",
              title: "boolean value",
              description: "Level 1 · Datatypes",
              question: `What does this print? (lowercase, as Java prints booleans)

\`\`\`java
boolean flag = false;
System.out.println(flag);
\`\`\``,
              expectedAnswer: "false",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "java-array-length",
              title: "Array length",
              description: "Level 1 · Datatypes",
              question: `What does this print?

\`\`\`java
int[] nums = { 7, 8, 9 };
System.out.println(nums.length);
\`\`\``,
              expectedAnswer: "3",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "java-cast-double-int",
              title: "Cast double to int",
              description: "Level 1 · Datatypes",
              question: `What does this print?

\`\`\`java
System.out.println((int) 9.99);
\`\`\``,
              expectedAnswer: "9",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
          ],
        },
        {
          id: "java-l2",
          level: 2,
          title: "Operators",
          blurb: "String concatenation and int math",
          challenges: [
            {
              id: "java-string-plus",
              title: "String concatenation",
              description: "Level 2 · Operators",
              question: `What does this print?

\`\`\`java
System.out.println("4" + 2);
\`\`\``,
              expectedAnswer: "42",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "java-int-div",
              title: "int division",
              description: "Level 2 · Operators",
              question: `What does this print?

\`\`\`java
System.out.println(9 / 4);
\`\`\``,
              expectedAnswer: "2",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
            {
              id: "java-modulo",
              title: "Modulo with ints",
              description: "Level 2 · Operators",
              question: `What does this print?

\`\`\`java
System.out.println(10 % 3);
\`\`\``,
              expectedAnswer: "1",
              acceptableAnswers: [],
              exp: 8,
              points: 4,
            },
          ],
        },
        {
          id: "java-l3",
          level: 3,
          title: "Conditionals",
          blurb: "if / else if and switch",
          challenges: [
            {
              id: "java-if-elseif",
              title: "if / else if / else",
              description: "Level 3 · Conditionals",
              question: `What is printed? (\`print\`, not \`println\`)

\`\`\`java
int v = 12;
if (v < 5) {
    System.out.print("a");
} else if (v < 20) {
    System.out.print("b");
} else {
    System.out.print("c");
}
\`\`\``,
              expectedAnswer: "b",
              acceptableAnswers: [],
              exp: 10,
              points: 5,
            },
            {
              id: "java-switch-int",
              title: "switch on int",
              description: "Level 3 · Conditionals",
              question: `What is printed?

\`\`\`java
int d = 3;
switch (d) {
    case 1:
        System.out.print("one");
        break;
    case 3:
        System.out.print("three");
        break;
    default:
        System.out.print("?");
}
\`\`\``,
              expectedAnswer: "three",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "java-switch-string",
              title: "switch on String",
              description: "Level 3 · Conditionals",
              question: `Java allows \`switch\` on \`String\`. What is printed?

\`\`\`java
String s = "go";
switch (s) {
    case "stop":
        System.out.print("S");
        break;
    case "go":
        System.out.print("G");
        break;
    default:
        System.out.print("X");
}
\`\`\``,
              expectedAnswer: "G",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
          ],
        },
        {
          id: "java-l4",
          level: 4,
          title: "Loops",
          blurb: "for loops and print vs println",
          challenges: [
            {
              id: "java-for-print",
              title: "for loop with print",
              description: "Level 4 · Loops",
              question: `What is printed? (\`print\`, not \`println\` — no newline at end)

\`\`\`java
for (int i = 0; i < 3; i++) {
    System.out.print(i);
}
\`\`\``,
              expectedAnswer: "012",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "java-while-print",
              title: "while with print",
              description: "Level 4 · Loops",
              question: `What is printed? (\`print\`, not \`println\`)

\`\`\`java
int j = 0;
while (j < 2) {
    System.out.print(j);
    j++;
}
\`\`\``,
              expectedAnswer: "01",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
            {
              id: "java-for-sum-println",
              title: "for loop and sum",
              description: "Level 4 · Loops",
              question: `What does this print?

\`\`\`java
int s = 0;
for (int k = 1; k <= 3; k++) {
    s += k;
}
System.out.println(s);
\`\`\``,
              expectedAnswer: "6",
              acceptableAnswers: [],
              exp: 12,
              points: 6,
            },
          ],
        },
      ],
    },
  ],
};

/** Flat list of all challenges for scoring / lookup */
window.CODING_CHALLENGES = (function flatten() {
  const out = [];
  const cr = window.CODE_ARENA_COURSE;
  if (!cr || !Array.isArray(cr.divisions)) return out;
  cr.divisions.forEach((div) => {
    (div.chapters || []).forEach((ch) => {
      (ch.challenges || []).forEach((c) => {
        out.push(c);
      });
    });
  });
  return out;
})();
