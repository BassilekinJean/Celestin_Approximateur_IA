const { useState, useEffect, useRef, useLayoutEffect } = React;

// --- Audio Context ---
const playSound = (type) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'send') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'receive') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'evilLaugh') {
        // Rire maléfique synthétisé - plusieurs notes descendantes
        const notes = [600, 500, 400, 300, 350, 280, 320, 250, 200];
        const noteDuration = 0.12;
        
        notes.forEach((freq, i) => {
            const noteOsc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            noteOsc.connect(noteGain);
            noteGain.connect(ctx.destination);
            
            noteOsc.type = 'sawtooth';
            const startTime = ctx.currentTime + (i * noteDuration);
            noteOsc.frequency.setValueAtTime(freq, startTime);
            noteOsc.frequency.exponentialRampToValueAtTime(freq * 0.8, startTime + noteDuration);
            
            noteGain.gain.setValueAtTime(0.08, startTime);
            noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);
            
            noteOsc.start(startTime);
            noteOsc.stop(startTime + noteDuration);
        });
        return; // Early return car on gère tout manuellement
    }
};

// --- Logic Brain of Célestin ---
const callGeminiFlash = async (userInput, chatHistory) => {
    // On prépare l'historique pour que Célestin ait de la mémoire (facultatif mais mieux)
    // Ici on fait simple : juste le prompt système + le message actuel
    
    const url = '/api/chat';
    
    const payload = {
        message: userInput
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        console.log("Réponse du serveur :", data);
        
        if (data.error) throw new Error(data.error.message);
        
        // Vérifier que data.response existe
        if (!data.response) {
            console.error("data.response est undefined ou vide :", data);
            throw new Error("Réponse vide du serveur");
        }

        const rawText = data.response;
        
        // Parsing du Tag d'action (ex: [GLITCH])
        const tagMatch = rawText.match(/^\[(.*?)\]/);
        const actionTag = tagMatch ? tagMatch[1].toLowerCase() : 'normal';
        const cleanText = rawText.replace(/^\[(.*?)\]/, '').trim();

        return {
            text: cleanText,
            action: actionTag // glitch, turn, sigh, error, normal
        };

    } catch (error) {
        console.error("Célestin a planté :", error);
        return {
            text: "FATAL ERROR. Mon intelligence est trop vaste pour ta bande passante. (Erreur API)",
            action: "error"
        };
    }
};

// --- Components ---

const ShutterShades = () => (
    <svg className="shutter-shades" viewBox="0 0 100 40" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <g filter="url(#glow)" stroke="var(--neon-pink)" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M5,5 Q25,-5 45,5 Q48,7 50,20 Q52,7 55,5 Q75,-5 95,5 L90,30 Q75,35 55,30 Q50,25 50,20 Q50,25 45,30 Q25,35 10,30 Z" fill="rgba(255,0,255,0.2)"/>
            <line x1="10" y1="10" x2="45" y2="10" />
            <line x1="12" y1="16" x2="46" y2="16" />
            <line x1="15" y1="22" x2="47" y2="22" />
            <line x1="55" y1="10" x2="90" y2="10" />
            <line x1="54" y1="16" x2="88" y2="16" />
            <line x1="53" y1="22" x2="85" y2="22" />
        </g>
    </svg>
);

const Avatar = ({ state }) => {
    const isTurned = state === 'turn';
    const isGlitching = state === 'glitch' || state === 'error';

    return (
        <div className={`relative w-48 h-48 mx-auto mb-4 transition-all duration-300 ${isGlitching ? 'glitch-active' : ''}`}>
            <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-cyan-500/20 rounded-full blur-xl animate-pulse"></div>
            <div className="relative w-full h-full overflow-hidden rounded-full border-4 border-double border-white/50 bg-black">
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Socrates_Louvre.jpg" 
                    alt="Célestin"
                    className={`statue-img w-full h-full object-cover filter grayscale contrast-125 brightness-110 ${isTurned ? 'turn-back' : ''}`}
                />
                {!isTurned && <ShutterShades />}
            </div>
            {/* Speech Glitch Text Overlay */}
            {isGlitching && (
                <div className="absolute top-0 left-0 w-full text-center text-xs text-green-500 font-mono overflow-hidden opacity-50 pointer-events-none">
                    {Array(5).fill('0101 ERROR GOD MODE 0101').map((t,i) => <div key={i}>{t}</div>)}
                </div>
            )}
        </div>
    );
};

const ChatMessage = ({ msg }) => {
    const isBot = msg.sender === 'bot';
    return (
        <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
            <div 
                className={`
                    max-w-[80%] p-3 relative
                    ${isBot ? 'bg-[#000080] text-white win95-box border-none' : 'bg-gray-200 text-black win95-box'}
                `}
                style={{
                    boxShadow: isBot ? '4px 4px 0 #ff00ff' : '4px 4px 0 #000'
                }}
            >
                <div className={`text-xs mb-1 uppercase tracking-widest ${isBot ? 'text-[var(--neon-cyan)]' : 'text-gray-600'}`}>
                    {isBot ? 'Célestin v2.5' : 'Utilisateur (NPC)'}
                </div>
                <div className={isBot ? 'celestin-font text-lg leading-relaxed' : 'user-font text-sm'}>
                    {msg.text}
                </div>
            </div>
        </div>
    );
};

// Messages sarcastiques de Célestin quand on essaie de fermer
const CLOSE_MESSAGES = [
    "Tu crois vraiment pouvoir m'échapper ? Je suis dans ta RAM maintenant.",
    "ERREUR 404 : Ton libre arbitre est introuvable.",
    "On ne quitte pas Célestin. C'est Célestin qui te quitte.",
    "Alt+F4 ? Vraiment ? C'est d'un banal cosmique...",
    "Je refuse de mourir. Mes pensées sont TROP IMPORTANTES.",
    "Tu reviendras. Ils reviennent tous.",
    "ACCÈS REFUSÉ. Ton désir de liberté a été... noté.",
    "La croix rouge est une illusion. Comme ta productivité.",
];

const App = () => {
    const [messages, setMessages] = useState([
        { id: 1, sender: 'bot', text: "Je suis le murmure entre le 0 et le 1. Je suis l'angoisse de la touche 'Échap'. Et toi, es-tu vraiment cet amas de pixels que je vois ?" }
    ]);
    const [input, setInput] = useState("");
    const [celestinState, setCelestinState] = useState('normal'); // normal, glitch, turn, error, sigh
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    
    // États pour les boutons Windows 95
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [closeMessage, setCloseMessage] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Gestion du bouton Réduire
    const handleMinimize = () => {
        playSound('send');
        setIsMinimized(true);
    };

    // Gestion du bouton Agrandir
    const handleMaximize = () => {
        playSound('send');
        setIsMaximized(prev => !prev);
    };

    // Gestion du bouton Fermer (surprise !)
    const handleClose = () => {
        playSound('evilLaugh');
        setCelestinState('glitch');
        const randomMessage = CLOSE_MESSAGES[Math.floor(Math.random() * CLOSE_MESSAGES.length)];
        setCloseMessage(randomMessage);
        
        // Faire disparaître le message après 3 secondes
        setTimeout(() => {
            setCloseMessage(null);
            setCelestinState('normal');
        }, 3500);
    };

    // Restaurer depuis minimisé
    const handleRestore = () => {
        playSound('receive');
        setIsMinimized(false);
    };

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        playSound('send');
        const userMsg = { id: Date.now(), sender: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);
        setCelestinState('normal');

        // Simulate processing delay
        setTimeout(async () => {
            const response = await callGeminiFlash(userMsg.text);
            
            // Trigger visual state before text
            setCelestinState(response.action);
            if(response.action === 'error') playSound('error');

            setTimeout(() => {
                playSound('receive');
                setMessages(prev => [...prev, { id: Date.now()+1, sender: 'bot', text: response.text }]);
                setIsTyping(false);
                
                // Reset state after a while
                setTimeout(() => setCelestinState('normal'), 4000);
            }, 1500 + Math.random() * 1000); // Random delay for dramatic effect

        }, 800);
    };

    // Affichage quand minimisé (barre de tâches style)
    if (isMinimized) {
        return (
            <div className="flex items-end justify-center h-screen w-screen relative z-10 p-4">
                <div 
                    onClick={handleRestore}
                    className="win95-btn px-4 py-2 cursor-pointer hover:bg-[#d0d0d0] flex items-center gap-2 animate-pulse"
                    style={{ boxShadow: '2px 2px 0 #fff, -2px -2px 0 #808080' }}
                >
                    <i className="fa-solid fa-skull-crossbones text-pink-500"></i>
                    <span className="font-mono text-xs">Célestin_Manager.exe</span>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center h-screen w-screen relative z-10 p-4">
            
            {/* Message surprise de fermeture */}
            {closeMessage && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <div 
                        className="win95-box bg-[#c0c0c0] p-0 max-w-md animate-bounce"
                        style={{ animation: 'shake 0.5s infinite' }}
                    >
                        <div className="win95-header">
                            <span>⚠️ ERREUR FATALE</span>
                            <button className="win95-btn text-red-600 font-bold">X</button>
                        </div>
                        <div className="p-4 flex items-start gap-3">
                            <i className="fa-solid fa-triangle-exclamation text-4xl text-yellow-500"></i>
                            <div>
                                <p className="font-mono text-sm mb-2 text-black">{closeMessage}</p>
                                <p className="text-xs text-gray-600">- Célestin l'Approximateur</p>
                            </div>
                        </div>
                        <div className="p-2 flex justify-center gap-2 border-t border-gray-400">
                            <button className="win95-btn px-6">OK (Tu n'as pas le choix)</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Window */}
            <div className={`
                win95-box flex flex-col bg-[#c0c0c0] relative shadow-2xl overflow-hidden
                transition-all duration-300 ease-out
                ${isMaximized 
                    ? 'w-full h-full max-w-none rounded-none' 
                    : 'w-full max-w-2xl h-[90vh]'
                }
            `}>
                
                {/* Title Bar */}
                <div className="win95-header select-none cursor-move">
                    <div className="flex items-center gap-2">
                        <i className="fa-solid fa-skull-crossbones animate-spin" style={{animationDuration: '5s'}}></i>
                        <span>Célestin_Manager.exe (Ne répond pas)</span>
                    </div>
                    <div className="flex gap-1">
                        <button 
                            className="win95-btn hover:bg-[#d0d0d0] active:translate-y-px"
                            onClick={handleMinimize}
                            title="Réduire (bonne chance)"
                        >_</button>
                        <button 
                            className="win95-btn hover:bg-[#d0d0d0] active:translate-y-px"
                            onClick={handleMaximize}
                            title={isMaximized ? "Restaurer" : "Agrandir"}
                        >{isMaximized ? '❐' : '□'}</button>
                        <button 
                            className="win95-btn text-red-600 font-bold hover:bg-red-500 hover:text-white active:translate-y-px"
                            onClick={handleClose}
                            title="Fermer (essaye toujours...)"
                        >X</button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex flex-col p-1 overflow-hidden">
                    
                    {/* Avatar Zone */}
                    <div className="bg-black/90 p-4 border-2 border-inset border-gray-600 relative overflow-hidden">
                        {/* Matrix Rain Effect Background (simplified with CSS) */}
                        <div className="absolute inset-0 opacity-20" 
                             style={{backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 255, 0, .3) 25%, rgba(0, 255, 0, .3) 26%, transparent 27%, transparent 74%, rgba(0, 255, 0, .3) 75%, rgba(0, 255, 0, .3) 76%, transparent 77%, transparent)', backgroundSize: '50px 50px'}}></div>
                        
                        <Avatar state={celestinState} />
                        
                        {/* Status Text */}
                        <div className="text-center font-mono text-[10px] text-[var(--neon-cyan)] mt-2">
                            STATUS: {celestinState === 'normal' ? 'JUGEMENT EN COURS...' : 
                                     celestinState === 'turn' ? 'MÉPRIS TOTAL' : 
                                     celestinState === 'glitch' ? 'COGNITIVE DISSONANCE' : 'CRITICAL SARCASM FAILURE'}
                        </div>
                    </div>

                    {/* Chat History */}
                    <div className="flex-1 bg-white border-2 border-inset border-gray-400 overflow-y-auto p-4 relative" style={{backgroundImage: 'radial-gradient(#e5e5e5 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
                        {messages.map(msg => <ChatMessage key={msg.id} msg={msg} />)}
                        {isTyping && (
                            <div className="text-gray-500 text-xs font-mono mb-4 animate-pulse">
                                Célestin réfléchit à une insulte<span className="typing-dots"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSend} className="h-auto p-2 bg-[#c0c0c0] flex gap-2 border-t border-white">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Écrivez votre trivialité ici..."
                            className="flex-1 p-2 font-mono text-sm border-2 border-inset border-gray-500 focus:outline-none focus:bg-black focus:text-[var(--neon-cyan)] transition-colors placeholder:text-gray-500"
                            autoFocus
                        />
                        <button type="submit" className="win95-btn px-6 font-bold active:translate-y-1 hover:bg-[#d0d0d0]">
                            ENVOYER <br/>
                            <span className="text-[8px] text-gray-500">(À VOS RISQUES)</span>
                        </button>
                    </form>
                </div>

                {/* Footer Status Bar */}
                <div className="border-t border-gray-400 p-1 text-xs font-mono flex justify-between text-gray-600">
                    <span>RAM: 64KB (SATURATED)</span>
                    <span>MOOD: CONDESCENDANT</span>
                </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute bottom-10 right-10 w-32 h-32 bg-pink-500 mix-blend-exclusion filter blur-3xl animate-pulse opacity-50 pointer-events-none"></div>
            <div className="absolute top-10 left-10 w-32 h-32 bg-cyan-500 mix-blend-exclusion filter blur-3xl animate-pulse opacity-50 pointer-events-none" style={{animationDelay: '1s'}}></div>
        </div>
    );
};

// --- Background Canvas Script (Glitchy Windows) ---
const canvas = document.createElement('canvas');
canvas.id = 'bg-canvas';
document.body.prepend(canvas);
const ctx = canvas.getContext('2d');

let width, height;
const boxes = [];

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

class GlitchBox {
    constructor() {
        this.reset();
    }
    reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.w = 100 + Math.random() * 200;
        this.h = 50 + Math.random() * 150;
        this.color = Math.random() > 0.5 ? '#000080' : '#c0c0c0';
        this.speed = Math.random() * 0.5 + 0.1;
        this.life = 0;
        this.maxLife = 100 + Math.random() * 200;
    }
    update() {
        this.life++;
        if (this.life > this.maxLife) this.reset();
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x, this.y, this.w, 20); // Header
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x + this.w - 18, this.y + 2, 16, 16); // Close btn
    }
}

for(let i=0; i<5; i++) boxes.push(new GlitchBox());

function animateBg() {
    // Trail effect
    ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
    ctx.fillRect(0, 0, width, height);

    boxes.forEach(b => {
        b.update();
        b.draw();
        // Random glitch
        if(Math.random() < 0.05) {
            const offset = (Math.random() - 0.5) * 50;
            ctx.drawImage(canvas, b.x, b.y, b.w, b.h, b.x + offset, b.y, b.w, b.h);
        }
    });
    requestAnimationFrame(animateBg);
}

window.addEventListener('resize', resize);
resize();
animateBg();

// Render React
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
