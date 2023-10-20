const initalState = {
  test: ["とんかつ", "焼売", "肉豆腐"],
  okazu_added: [],
  bento_registered: [],
  bento_purchased: [],
  bento_purchased_details: [],
};

const okazuReducer = (state = initalState, action) => {
  switch (action.type) {
    case "test":
      return state;

    case "okazu-added":
      state.okazu_added.push(action.payload);
      return state;

    default:
      return state;
  }
};

export default okazuReducer;
