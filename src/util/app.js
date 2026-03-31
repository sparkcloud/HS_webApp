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