import { HfInference } from "@huggingface/inference"

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

export async function embedText(text) {
    try {
        const result = await hf.featureExtraction({
            model: "sentence-transformers/all-MiniLM-L6-v2",
            inputs: text,
        })

        // Result can be nested (array of arrays) or flat (array of numbers)
        // We always want a flat array of 384 numbers
        if (Array.isArray(result[0])) {
            return result[0]
        }
        return result
    } catch (error) {
        console.error("Hugging Face embedding failed:", error)
        return null
    }
}
