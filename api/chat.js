export default function handler(req, res) {
  return res.status(200).json({
    method: req.method,
    hasKey: !!process.env.OPENAI_API_KEY
  });
}
