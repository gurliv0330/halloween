//game orders

const POTION_ORDERS = [
    {

        name:"Glowing Potion", 
        dialogue: "PARDON MEEEE!!!!! I AM BNUUYYYY THE VAMPIRE BUNNY!!! I NEED A GLOWING POTION TO BRIGHTEN MY MOONLIT WINGSS!!!!! HURRYY!!!!!!!",
        recipe: ['moonflower', 'gigglesap'],
        color: "#6bdb92",
        reward: 10,
        hint: "Moonflower + Gigglesap"

    },

    {
        name: "Giggle Elixir",
        dialogue: "MUHEHEHEHEHEHEHEHEEHE!! BNUUYYY WANTS TO MAKE THESE FILTHY HUMANS ALL GIDDYYYY!!! HELP BNUUYY IN HIS ABSILUTELY EVIL PLANNN!!!!",
        recipe: ['gigglesap', 'stardust'],
        color: "#f578bf",
        reward: 15,
        hint: "Gigglesap + Stardust"
        },

    {
        name: "Stardust Tonic", 
        dialogue: "THE MIDNIGHT SKY IS FULL OF STARSSSSS!!! BNUUYY NEEDS EM IN A TONIC!! QUICK U STEWPID HUMAN!!!!",
        recipe: ['stardust', 'moonflower'],
        color: "#e6c74e",
        reward: 20,
        hint: "Stardust + Moonflower"
    },

    {
        name: "Void Brew", 
        dialogue: "BNUUYYY FEELS LIKE BEING MYSTERIOUS TONIGHT!! GET HIM A VOID BREW OR ELSEEEE!!!!",
        recipe: ['skullbark', 'shadowessence'],
        color: "#3c225f",
        reward: 25,
        hint: "Skullbark + ShadowEssence"
    },

    {
        name: "Moonlit Draught",
        dialogue: "BNUUYS FUR IS DRYINGGG!!! GIVE HIM A CALM LUNAR POTION",
        recipe: ['moonflower', 'shadowessence'],
        color: "#875cb4",
        reward: 20,
        hint: "Moonflower + Shadow Essence"
    },
    {
        name: "Sparkle Splash",
        dialogue: "BNUUYYYY IS THROWING A HUGE VAMPIRE PARTY!! GIVE HIM THE DRINKS!!",
        recipe: ['stardust', 'skullbark'],
        color: "#7fafee",
        reward: 30,
        hint: "Stardust + Skullbark"
    }
     
];

let currentOrderIndex = 0;
let currentIngredients = [];
let coins = 0;
let audioCtx;
let isHintVisible = false;

const upgrades = {
    goldenCauldron: false,
    bubbleWand: false
};

const coinsEl = document.getElementById('coin-count');
const cauldronLiquid = document.getElementById('cauldron-liquid');
const cauldronSvg = document.getElementById('cauldron-svg');
const potionResultText = document.getElementById('potion-result-text');
const serveBtn = document.getElementById('serve-btn');
const dialogOverlay = document.getElementById('custom-dialog-overlay');
const dialogTitle = document.getElementById('dialog-title');
const dialogBody = document.getElementById('dialog-body');
const orderText = document.getElementById('order-text');
const recipeHint = document.getElementById('recipe-hint');
const hintText = document.getElementById('hint-text');
const ingredientTags = document.getElementById('ingredient-tags');

//edit
const shopModalOverlay = document.getElementById('upgrade-shop-overlay');

// audio
function initAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playSound(freq, type = 'sine', decay = 0.4) {
    try {
        initAudio();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + decay);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + decay);
    } catch (e) {
        
    }
}

function loadOrder(index) {
    const order = POTION_ORDERS[index];
    orderText.textContent = order.dialogue;
    hintText.textContent = order.hint;

    isHintVisible = false;
    recipeHint.classList.add('hint-hidden');
}

function toggleRecipeHint() {
    playSound(600, 'sine', 0.1);
    isHintVisible = !isHintVisible;
    if (isHintVisible) {
        recipeHint.classList.remove('hint-hidden');

    } else {
        recipeHint.classList.add('hint-hidden');

    }
}

//ingridient actions

function addIngredient(ingId) {
    playSound(450, 'triangle', 0.1);
    if (currentIngredients.includes(ingId)) return;

    cauldronSvg.classList.add('active');
    setTimeout(() => cauldronSvg.classList.remove('active'), 400);

    currentIngredients.push(ingId);
    
    const btn = document.getElementById(ingId);
    if(btn) btn.classList.add('selected');

    updateIngredientDisplay();
    updateServeState();
}

function clearCauldron() {
    playSound(200, 'sawtooth', 0.2);
    currentIngredients = [];
    resetIngredientButtons();
    updateIngredientDisplay();
    updateServeState();
    cauldronLiquid.style.fill = "#5e4e6d";
    
}

function resetIngredientButtons() {
    document.querySelectorAll('.ingredient-btn').forEach(btn => btn.classList.remove('selected'));
}

function updateIngredientDisplay() {
    if (currentIngredients.length === 0) {
        ingredientTags.textContent = "None";

    } else {
        ingredientTags.textContent = currentIngredients.map(id => {
            const btn = document.getElementById(id);
            return btn ? btn.querySelector('.ing-label').textContent : id;

        }).join(" + ");
    }
}

function updateServeState() {
    if (currentIngredients.length >= 2) {
        serveBtn.classList.add('ready');

    } else {
        serveBtn.classList.remove('ready');
    }
}

//serving 

function servePotion() {
    if (!serveBtn.classList.contains('ready')) return;

    const order = POTION_ORDERS[currentOrderIndex];
    const isCorrect = currentIngredients.length === order.recipe.length &&
    currentIngredients.every(ing => order.recipe.includes(ing));

    resetIngredientButtons();
    updateServeState();

    if(isCorrect) {
        cauldronLiquid.style.fill = order.color;
        potionResultText.textContent = "SUCCESSSS!!!!";
        playSound(784, 'sine', 0.6);

        setTimeout(() => {
            //2x multipler
            const finalReward = upgrades.goldenCauldron ? order.reward * 2 : order.reward;
            coins += finalReward;
            coinsEl.textContent = coins;

            showDialog("MAGICAL SUCSSS!!!", `BNUUYYY drank the ${order.name} and absolutely loves it! Out of generosity, BNUUYYY gave u ${finalReward} Moon Coins! 🪙 `);
            currentOrderIndex = (currentOrderIndex + 1) % POTION_ORDERS.length;
            loadOrder(currentOrderIndex);

            potionResultText.textContent = "";
            cauldronLiquid.style.fill = "#5e4e6d";
            currentIngredients = [];
            updateIngredientDisplay();

        }, 1200);

    } else {
        playSound(120, 'sawtooth', 0.4);
        potionResultText.textContent = "Confused puff... gray smoke";

        setTimeout(() => {
            showDialog("Gray Smoke... ", "OOPSIE DAISIES! BNUUYYY is super confused. That wasn't the right ingredient mix! Click BNUUYYY or their speech bubble if you need a hint!"); 
            potionResultText.textContent = "";
            cauldronLiquid.style.fill = "#5e4e6d";
            currentIngredients = [];
            updateIngredientDisplay();

        }, 1200);
    }
}

function openShopModal() {
    playSound(523, 'sine', 0.2); 
    shopModalOverlay.classList.add('active');
}

function closeShopModal () {
    shopModalOverlay.classList.remove('active');
}

function closeUpgradeShopOnOuter(e) {
    if (e.target.id === 'upgrade-shop-overlay') closeShopModal();
}

function buyUpgrade(type) {
    if (type === 'goldenCauldron' && coins >= 50 && !upgrades.goldenCauldron) {
        coins -= 50;
        upgrades.goldenCauldron = true;
        coinsEl.textContent = coins;

        // Visual Cauldron Transformation
        document.getElementById('cauldron-body').setAttribute('fill', '#e7ce6b');
        document.getElementById('cauldron-rim').setAttribute('fill', '#fde68a');
        document.getElementById('cauldron-leg-l').setAttribute('fill', '#b38f24');
        document.getElementById('cauldron-leg-r').setAttribute('fill', '#b38f24');
        cauldronSvg.classList.add('golden-glow');

        //disable 
        const btn = document.getElementById('buy-golden-cauldron');
        if(btn) {
            btn.textContent = "Owned";
            btn.disabled = true;
        }

        playSound(700, 'triangle', 0.5);
    } else if (type === 'bubbleWand' && coins >= 30 && !upgrades.bubbleWand) {
        coins -= 30;
        upgrades.bubbleWand = true;
        coinsEl.textContent = coins;

        document.getElementById('cauldron-bubbles').classList.remove('bubbles-hidden');

        const btn = document.getElementById('buy-bubble-wand');
        if(btn) {
            btn.textContent = "Owned";
            btn.disabled = true;
        }

        playSound(800, 'triangle', 0.5);
    } else {
        playSound(150, 'sawtooth', 0.2);
    }
}

//dialog handlers

function showDialog(title, body) {
    dialogTitle.textContent = title;
    dialogBody.textContent = body;
    dialogOverlay.classList.add('active');
}

function closeDialog() {
    dialogOverlay.classList.remove('active');
}

function closeDialogOnOuter(e) {
    if (e.target.id === 'custom-dialog-overlay') closeDialog();
}

// Canvas Floating Particles
const canvas = document.getElementById('shop-canvas');
const ctxAmbient = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight; 
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

const floaties = Array.from({ length: 25}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speedY: -Math.random() * 1.5 - 0.5,
    opacity: Math.random() * 0.4 + 0.1,
    color: Math.random() > 0.5 ? '#774fa1' : '#ee5daf'
}));

function animateAmbient() {
    ctxAmbient.clearRect(0, 0, canvas.width, canvas.height);
    floaties.forEach(f => {
        f.y += f.speedY;
        if (f.y < 0) f.y = canvas.height;
        ctxAmbient.fillStyle = f.color;
        ctxAmbient.globalAlpha = f.opacity;
        ctxAmbient.beginPath();
        ctxAmbient.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctxAmbient.fill();
    });
}

requestAnimationFrame(animateAmbient);

loadOrder(0);
animateAmbient();