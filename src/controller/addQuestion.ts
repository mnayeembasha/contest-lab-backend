import { Question } from "../models/questionModel"

function toSlug(title) {
    return title.toLowerCase().replace(/\s+/g, '-');
}


export const addQuestion = async(req,res)=>{
    try{
        const {title,description,testCases,difficulty,category,constraints,starterCode,examples,testcases,hiddenTestCases} = req.body;
        const slug = toSlug(title);
         await Question.create({
            title,slug,description,testCases,difficulty,category,constraints,starterCode,examples,testcases,hiddenTestCases
        });
        res.status(201).json({ message: "Question added successfully"});
    }catch(error){
        res.status(500).json({ message: "Server Error | Unable to add Question", error });
    }
}