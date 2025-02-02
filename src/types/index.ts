export interface TestCase {
    input: string;
    expected: string | null;
  }

export interface Question {
    title: string;
    description: string;
    testCases: TestCase[];
    templateCode?: string;
}