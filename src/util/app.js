const supabaseUrl = 'https://maxhdworgaesxjmbcqqc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1heGhkd29yZ2Flc3hqbWJjcXFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDAyMzIsImV4cCI6MjA5MDU3NjIzMn0.CPfuGjP6Jw0NLwSDz_69TaKeSQSA6ZFCA9azYIYYP7s';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// --- AUTHENTICATION DOM ELEMENTS ---
const authContainer = document.getElementById('auth-container');
const appContainer = document.getElementById('app-container');
const emailInput = document.getElementById('email-input');
const passwordInput = document.getElementById('password-input');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const authMessage = document.getElementById('auth-message');

// --- SIGN UP LOGIC ---
signupBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authMessage.textContent = "Loading...";

    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
    });

    if (error) {
        authMessage.style.color = 'red';
        authMessage.textContent = error.message;
    } else {
        authMessage.style.color = 'green';
        authMessage.textContent = "Success! You can now Log In.";
    }
});

// --- LOG IN LOGIC ---
loginBtn.addEventListener('click', async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    authMessage.textContent = "Loading...";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        authMessage.style.color = 'red';
        authMessage.textContent = error.message;
    } else {
        console.log("Login successful! User data:", data.user);

        // Hide the auth screen and show the main app
        authContainer.classList.add('hidden');
        appContainer.classList.remove('hidden');

        // Clear the inputs
        emailInput.value = '';
        passwordInput.value = '';
    }
});

document.getElementById('predict-btn').addEventListener('click', () => {
    // 1. Gather the selected values from the three dropdowns
    const val1 = document.getElementById('q1').value;
    const val2 = document.getElementById('q2').value;
    const val3 = document.getElementById('q3').value;

    const choices = [val1, val2, val3];

    // 2. Count the frequency of each chosen pathway
    const counts = {};
    choices.forEach(choice => {
        counts[choice] = (counts[choice] || 0) + 1;
    });

    // 3. Determine the winning pathway
    let highestCount = 0;
    // We default to the first choice. If they pick 3 different options (a tie),
    // the system naturally prioritizes what they do in their "free time" (val1).
    let winningPathway = choices[0];

    for (const path in counts) {
        if (counts[path] > highestCount) {
            highestCount = counts[path];
            winningPathway = path;
        }
    }

    // 4. Map the internal backend value to a human-readable display string
    const pathwaysMap = {
        'tech': 'Technology & Engineering 💻',
        'health': 'Health & Human Services 🤝',
        'arts': 'Creative Arts & Humanities 🎨'
    };

    // 5. Update the UI to reveal the final result
    const resultText = document.getElementById('result-text');
    const resultContainer = document.getElementById('result-container');

    resultText.textContent = pathwaysMap[winningPathway];

    // Remove the 'hidden' CSS class to show the box with a fade-in animation
    resultContainer.classList.remove('hidden');
});