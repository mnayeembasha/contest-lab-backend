import mongoose, { Schema, Document } from "mongoose";

export interface Example {
  id?: number;
  inputText: string;
  outputText: string;
  explanation?: string;
}

export interface TestCase {
  id?: number;
  input: string;
  expected: string;
}

export interface IQuestion extends Document {
  title: string;
  slug: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  starterCode?: {
    python?: string;
    javascript?: string;
    java?: string;
    c?: string;
    "c++"?: string;
  };
  constraints?: string[];
  image?: string;
  examples?: Example[];
  testCases: TestCase[];
  hiddenTestCases: TestCase[];
}

const ExampleSchema = new Schema<Example>({
  id: { type: Number, default: 1 },
  inputText: { type: String, required: true },
  outputText: { type: String, required: true },
  explanation: { type: String },
});

const TestCaseSchema = new Schema<TestCase>({
  id: { type: Number, default: 1 },
  input: { type: String, required: true },
  expected: { type: String, required: true },
});

const questionSchema = new Schema<IQuestion>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], required: true },
    category: { type: String, required: true },
    starterCode: {
      type: Map,
      of: String,
      default: {},
    },
    constraints: { type: [String], default: [] },
    image: { type: String },
    examples: { type: [ExampleSchema], default: [] },
    testCases: { type: [TestCaseSchema], required: true },
    hiddenTestCases: { type: [TestCaseSchema], required: true },
  },
  { timestamps: true }
);



questionSchema.pre("save", function (next) {
  if (!this.examples) this.examples = [];
  if (!this.testCases) this.testCases = [];
  if (!this.hiddenTestCases) this.hiddenTestCases = [];

  this.examples.forEach((example, index) => {
    if (!example.id) example.id = index + 1;
  });
  this.testCases.forEach((testCase, index) => {
    if (!testCase.id) testCase.id = index + 1;
  });
  this.hiddenTestCases.forEach((hiddenTestCase, index) => {
    if (!hiddenTestCase.id) hiddenTestCase.id = index + 1;
  });

  next();
});


export const Question = mongoose.model<IQuestion>("Question", questionSchema);




