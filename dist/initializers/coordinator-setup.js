import Coordinator from '../models/coordinator.js';

/* eslint-disable prettier/prettier */
var coordinatorSetup = {
  name: "setup coordinator",
  initialize: function () {
    let app = arguments[1] || arguments[0];
    app.register("drag:coordinator", Coordinator);
  }
};

export { coordinatorSetup as default };
//# sourceMappingURL=coordinator-setup.js.map
