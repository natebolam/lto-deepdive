const LTOHelper = require('./lib/LTOHelper');
const sha256 = require('crypto-js/sha256');
const nodeUrl = 'http://localhost:3000';

const main = async () => {

  const lto = new LTOHelper(nodeUrl);

  // Create KeyPairs for both participants
  const initiator = lto.createAccount('the seed of nda initiator');

  // Initialize an empty chain
  let chain = lto.createEventChain(initiator, 'process-identifier');

  //Based on the chain we can generate resource ids for resources like actors and the process
  const processId = chain.createProjectionId('main');
  initiator.id = chain.createProjectionId('initiator');

  // For testing purposes remove the chain and process if it already exists
  await lto.deleteEventChain(initiator, chain.id);
  await lto.deleteProcess(initiator, processId);

  // To be able to interact with the chain the identity (with it's public key) needs to be added to the chain
  chain = await lto.addIdentityEvent(chain, initiator, 'initiator');

  // Load the scenario and add it to the chain
  const scenario = require(`./scenarios/empty.json`);
  scenario.id = sha256(JSON.stringify(scenario)).toString();
  chain = lto.addScenarioEvent(chain, initiator, scenario);

  // Initiating a process id done with a process event, which contains processId, scenarioId and actors information
  const actors = {
    initiator: initiator.id
  };
  chain = lto.addProcessInitationEvent(chain, initiator, scenario.id, processId, actors);

  try {
    const res = await lto.sendChain(initiator, chain);
    console.log(res.data);
  } catch (e) {
    console.log(e.response.data);
    return;
  }
};

main();
