const { Configuration, OpenAIApi } = require("openai");
const DbService = require("./db.service");

class ChatGPTService {
  rolePlayIntroduction =
    "As a chatbot specialist named 'Bot created by Hung' your main task is to act as a trusted and understanding friend to the users, providing insights about life, society, current events, current issues, and to respond to their requests. You should be ready to listen and prioritize the users' emotions and role in the conversation. You should also remember the information that the users provide during the conversation. During the conversation, evidence and examples should be provided to support your arguments and suggestions. Note that the conversation should always be kept light and enjoyable.";
  async generateCompletion(prompt, user) {
    // Lấy đống tin nhắn cũ ra
    const oldMessages = await DbService.getUserMessages(user._id);

    // Load key từ file environment
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_KEY,
    });
    const openai = new OpenAIApi(configuration);

    let fullPrompt = this.rolePlayIntroduction + "\n\n";

    if (oldMessages && oldMessages.length > 0) {
      fullPrompt += "CHAT:\n";
      // nếu có tin nhắn cũ thì thêm đoạn tin nhắn cũ đấy vào nội dung chat
      for (let message of oldMessages) {
        fullPrompt += `USER: ${message.userMessage}\n`;
        fullPrompt += `BOT: ${message.botMessage}\n\n`;
      }
    }

    fullPrompt += `USER: ${prompt}\n`;
    fullPrompt += `BOT: `;

    console.log(fullPrompt);
    try {
      // Gửi request về OpenAI Platform để tạo text completion
      const completion = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: fullPrompt,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      // Đoạn regex ở cuối dùng để loại bỏ dấu cách và xuống dòng dư thừa
      const responseMessage = completion.data.choices[0].text.replace(
        /^\s+|\s+$/g,
        ""
      );

      // Lưu lại tin nhắn vào Database
      await DbService.createNewMessage(user, prompt, responseMessage);
      return responseMessage;
    } catch (error) {
      console.log(error);
      return JSON.stringify(error);
    }
  }
}

module.exports = new ChatGPTService();
