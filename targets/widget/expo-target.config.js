
/** @type {import('@bacons/apple-targets').ConfigPlugin} */
module.exports = (config) => {
  console.log('Configuring PetProgress widget target...');
  
  return {
    type: "widget",
    name: "PetProgressWidget",
    displayName: "PetProgress",
    frameworks: ["SwiftUI", "WidgetKit"],
    deploymentTarget: "17.0",
    entitlements: {
      "com.apple.security.application-groups": 
        config.ios?.entitlements?.["com.apple.security.application-groups"] || 
        ["group.com.petprogress.app"]
    }
  };
};
