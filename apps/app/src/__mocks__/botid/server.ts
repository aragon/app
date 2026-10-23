const checkBotId = jest.fn(() =>
    Promise.resolve({ isBot: false, isHuman: true, isVerifiedBot: false }),
);

export { checkBotId };
