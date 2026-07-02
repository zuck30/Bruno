# Mambo, Welcome to Bruno.

<p align="center">
    <a href="https://github.com/zuck30/Bruno"><img src="https://img.shields.io/badge/status-active-brightgreen.svg"></a>
    <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB.svg"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-3178C6.svg"></a>
    <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-5-646CFF.svg"></a>
    <a href="https://github.com/zuck30/Bruno/stargazers"><img src="https://img.shields.io/github/stars/zuck30/Bruno.svg?logo=github"></a>
    <img src="https://visitor-badge.laobi.icu/badge?page_id=zuck30.Bruno" alt="visitors"/>   
</p>

<p align="center">
    <img src="public/bot.png " alt="Bruno Screenshot" width="360">
</p>

<h3>🚀 Quick Links</h3>

<div align="left">
    <a href="https://github.com/zuck30/Bruno"><img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub"></a>
    <a href="mailto:mwalyangashadrack@gmail.com"><img src="https://img.shields.io/badge/Contact-30302f?style=flat-square&logo=gmail" alt="Contact"></a>
    <a href="https://github.com/zuck30/Bruno/issues"><img src="https://img.shields.io/badge/Report%20Bug-30302f?style=flat-square&logo=github" alt="Report Bug"></a>
    <a href="https://github.com/zuck30/Bruno/discussions"><img src="https://img.shields.io/badge/Discussions-30302f?style=flat-square&logo=github" alt="Discussions"></a>
</div>

<br>

# About Bruno

**Bruno** is an open-source AI agent built and developed in Tanzania. He is a warm, intelligent, and trustworthy friend who knows everything about Tanzania's history, culture, geography, people, economy, wildlife, daily life, and more. Bruno is also a capable general AI assistant with knowledge about global topics.

# Core Bruno
- **Built in Tanzania**  Created by Tanzanian developers for the world
- **Knowledgeable**  Deep expertise in all things Tanzania
- **Friendly & Approachable**  Conversational, warm, and professional
- **Global Ready**  Multilingual support (English, Swahili, and more)
- **Open & Free**  MIT licensed, community-driven

# Tavily Search Integration

Bruno uses **Tavily** for real-time web search capabilities when in Search mode.

# What is Tavily?
Tavily is a search API optimized for AI agents. It provides:
- Accurate, summarized search results
- Source attribution
- Answer extraction
- Clean, structured data

# Setup
1. Get your Tavily API key from [Tavily](https://tavily.com/)
2. Set the secret in Supabase in terminal or dashboard:



# Installation

1. Clone the repository:
```bash
git clone https://github.com/zuck30/Bruno.git
cd Bruno
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```


# Deepseek API
Bruno uses Deepseek's API for generating responses. The system prompt is carefully crafted to ensure Bruno's personality and knowledge areas are consistent.

# Supabase Edge Function
The chat functionality is deployed as a Supabase Edge Function for:
- Serverless scaling
- Secure API key management
- Low-latency responses


# Changing Bruno's Personality
Edit the `SYSTEM_PROMPT` in `supabase/functions/bruno-chat/index.ts`

# Adding Quick Prompts
Modify the `quickPrompts` array in `src/components/ai/BrunoChat.tsx`

# Styling
Update `tailwind.config.cjs` for colors, fonts, and Kitenge patterns


# Roadmap

- [ ] Voice input support
- [ ] Image generation capability
- [ ] Conversation history persistence
- [ ] Mobile app (React Native)
- [ ] WhatsApp integration
- [ ] Custom knowledge base upload
- [ ] Community contributions hub


# Contributing

Bruno is open source and we welcome contributions! Here's how you can help:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

# Contribution Guidelines
- Follow the existing code style
- Add comments for complex logic
- Update documentation for new features
- Test thoroughly before submitting

# License

This project is licensed under the **MIT License** see the [LICENSE](LICENSE) file for details.

# Support & Community

- 📫 **Email**: mwalyangashadrack@gmail.com
- 💬 **Discussions**: [GitHub Discussions](https://github.com/zuck30/Bruno/discussions)
- 🐛 **Issues**: [Report a Bug](https://github.com/zuck30/Bruno/issues)


<p align="center">
    <img src="public/shot.png " alt="Bruno Screenshot" width="800">
</p>