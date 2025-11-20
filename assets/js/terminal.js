document.addEventListener('DOMContentLoaded', () => {
    const terminalOverlay = document.getElementById('terminal-overlay');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    const closeBtn = document.querySelector('.close-dot');
    
    // Open/Close Logic
    window.openTerminal = () => {
        terminalOverlay.style.display = 'flex';
        terminalInput.focus();
    };

    closeBtn.addEventListener('click', () => {
        terminalOverlay.style.display = 'none';
    });

    // Click outside to close
    terminalOverlay.addEventListener('click', (e) => {
        if (e.target === terminalOverlay) {
            terminalOverlay.style.display = 'none';
        }
    });

    // Command History
    let commandHistory = [];
    let historyIndex = -1;

    // Commands Logic
    const commands = {
        help: () => `Available commands:
  <span class="success">about</span>     - Who am I?
  <span class="success">posts</span>     - List all blog posts
  <span class="success">social</span>    - Display social links
  <span class="success">clear</span>     - Clear the terminal
  <span class="success">exit</span>      - Close terminal`,
        
        about: () => `Soham's Blog v1.0.0
Exploring science, code, and uncertainty.
Based in the digital realm.`,

        social: () => `Connect with me:
  Twitter:  <a href="${window.siteData.twitter}" target="_blank">@twitter</a>
  GitHub:   <a href="${window.siteData.github}" target="_blank">@github</a>
  LinkedIn: <a href="${window.siteData.linkedin}" target="_blank">@linkedin</a>`,

        posts: () => {
            // This data would ideally be injected from Liquid
            return window.siteData.posts.map(p => `- <a href="${p.url}">${p.title}</a> (${p.date})`).join('\n');
        },

        clear: () => {
            terminalOutput.innerHTML = '';
            return '';
        },

        exit: () => {
            terminalOverlay.style.display = 'none';
            return '';
        }
    };

    // Handle Input
    terminalInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const input = terminalInput.value.trim();
            if (input) {
                // Add to history
                commandHistory.push(input);
                historyIndex = commandHistory.length;

                // Display Command
                const commandLine = document.createElement('div');
                commandLine.innerHTML = `<span class="prompt-user">visitor@soham-blog:~$</span> ${input}`;
                terminalOutput.appendChild(commandLine);

                // Process Command
                const cmd = input.split(' ')[0].toLowerCase();
                let response = '';

                if (commands[cmd]) {
                    response = commands[cmd]();
                } else {
                    response = `<span class="error">Command not found: ${cmd}. Type 'help' for list.</span>`;
                }

                if (response) {
                    const outputDiv = document.createElement('div');
                    outputDiv.className = 'output';
                    outputDiv.innerHTML = response;
                    terminalOutput.appendChild(outputDiv);
                }

                terminalInput.value = '';
                
                // Scroll to bottom
                const body = document.getElementById('terminal-body');
                body.scrollTop = body.scrollHeight;
            }
        } else if (e.key === 'ArrowUp') {
            if (historyIndex > 0) {
                historyIndex--;
                terminalInput.value = commandHistory[historyIndex];
            }
        } else if (e.key === 'ArrowDown') {
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                terminalInput.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                terminalInput.value = '';
            }
        }
    });

    // Focus input when clicking anywhere in body
    document.getElementById('terminal-body').addEventListener('click', () => {
        terminalInput.focus();
    });
});

