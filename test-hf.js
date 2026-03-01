import { HfInference } from "@huggingface/inference"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

async function main() {
    try {
        console.log("Extracting features...");
        const result = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: "Hello world",
        })
        console.log("Result type:", typeof result);
        console.log("Is array?", Array.isArray(result));
        if (Array.isArray(result)) {
            console.log("Array length:", result.length);
            console.log("First element type:", typeof result[0]);
            if (Array.isArray(result[0])) {
                console.log("First element array length:", result[0].length);
            }
        } else {
            console.log("Result:", result);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

main();
