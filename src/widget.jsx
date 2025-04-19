
import { useState } from 'react';
import { motion } from 'framer-motion';

const MODES = ["Residential","Commercial","Tender","Insurance"];
const questions = [
  "How many rooms or zones do you need coverage for?",
  "Do you prefer ceiling or wall‑mounted speakers?",
  "Would you like Bluetooth streaming capability?",
  "Any preferred brands or budget range?"
];

export default function AudicoQuoteWidget() {
  const [mode, setMode] = useState("Residential");
  const [messages, setMessages] = useState([{ sender:"ai", text:"Hi! Let's start building your quote. What would you like help with today?" }]);
  const [input, setInput] = useState("");
  const [step, setStep] = useState(0);
  const [quoteItems, setQuoteItems] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages(m => [...m, userMessage]);
    setInput("");

    const nextStep = step + 1;
    setStep(nextStep);

    const followUp = nextStep < questions.length
      ? questions[nextStep]
      : "Thanks! I'm preparing your quote now...";

    setTimeout(() => {
      setMessages(m => [...m, { sender: "ai", text: followUp }]);
    }, 300);

    if (nextStep >= questions.length) {
      try {
        const response = await fetch(
          `https://audico-api-gpt.onrender.com/search_gpt?query=${encodeURIComponent(input)}&mode=${mode}`
        );
        const data = await response.json();

        if (data?.quote?.length > 0) {
          setQuoteItems(data.quote);
        } else {
          setMessages(m => [...m, { sender: "ai", text: "I couldn't find matching products, but let me know if you'd like alternatives." }]);
        }
      } catch (err) {
        console.error(err);
        setMessages(m => [...m, { sender: "ai", text: "Oops! Something went wrong fetching your quote." }]);
      }
    }
  };

  const subtotal = quoteItems.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      {/* CHAT AREA */}
      <div className="md:col-span-2 bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
        <div className="flex gap-3 p-4 border-b">
          {MODES.map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={\`px-4 py-2 rounded-full transition \${m === mode ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}\`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={\`max-w-[75%] p-4 rounded-xl shadow-md \${msg.sender === "ai" ? "bg-blue-50 text-gray-900 rounded-bl-none" : "bg-green-50 text-gray-900 self-end rounded-br-none"}\`}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>

        <div className="border-t p-4 flex items-center">
          <input
            className="flex-1 border border-gray-300 rounded-l-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type your answer…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-r-lg font-semibold transition"
          >
            Send
          </button>
        </div>
      </div>

      {/* QUOTE PANEL */}
      <div className="bg-white rounded-2xl shadow-lg p-6 h-[600px] overflow-y-auto">
        <h3 className="text-2xl font-bold mb-4">Your Quote</h3>
        <ul className="space-y-3">
          {quoteItems.length > 0 ? quoteItems.map((item, index) => (
            <li key={index} className="flex justify-between">
              <span>{item.name} (x{item.qty})</span>
              <span>R{(item.price * item.qty).toFixed(2)}</span>
            </li>
          )) : (
            <>
              <li className="flex justify-between"><span>Example Product 1</span><span>R1,799</span></li>
              <li className="flex justify-between"><span>Example Product 2</span><span>R6,999</span></li>
            </>
          )}
        </ul>
        <div className="mt-4 border-t pt-4 flex justify-between font-semibold">
          <span>Subtotal</span>
          <span>R{subtotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
