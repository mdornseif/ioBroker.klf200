"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupScenes = void 0;
const propertyLink_1 = require("./util/propertyLink");
const stateHelper_1 = require("./util/stateHelper");
const utils_1 = require("./util/utils");
class SetupScenes {
    static async createScenesAsync(adapter, scenes) {
        const disposableEvents = [];
        // Remove old scenes
        const currentScenesList = await adapter.getChannelsOfAsync(`scenes`);
        adapter.log.debug(`Current Scenes List: ${JSON.stringify(currentScenesList)}`);
        // Filter current channels to contain only those, that are not present in the provided scenes list
        const channelsToRemove = currentScenesList.filter((channel) => !scenes.some((scene) => {
            return scene.SceneID === Number.parseInt(channel._id.split(".").reverse()[0]);
        }));
        // Delete channels
        for (const channel of channelsToRemove) {
            await adapter.deleteChannelAsync(`scenes`, channel._id);
        }
        if (channelsToRemove.length !== 0) {
            adapter.log.info(`${channelsToRemove.length} unknown scenes removed.`);
        }
        for (const scene of scenes) {
            if (scene) {
                disposableEvents.push(...(await this.createSceneAsync(adapter, scene)));
            }
        }
        // Write number of products
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `scenes.scenesFound`, {
            name: "Number of scenes found",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            def: 0,
            desc: "Number of scenes defined in the interface",
        }, {}, (0, utils_1.ArrayCount)(scenes));
        return disposableEvents;
    }
    static async createSceneAsync(adapter, scene) {
        const disposableEvents = [];
        await adapter.setObjectNotExistsAsync(`scenes.${scene.SceneID}`, {
            type: "channel",
            common: {
                name: scene.SceneName,
                role: "scene",
            },
            native: {},
        });
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `scenes.${scene.SceneID}.productsCount`, {
            name: "productsCount",
            role: "value",
            type: "number",
            read: true,
            write: false,
            desc: "Number of products in the scene",
        }, {}, (0, utils_1.ArrayCount)(scene.Products));
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `scenes.${scene.SceneID}.products`, {
            name: "products",
            role: "value",
            type: "array",
            read: true,
            write: false,
            desc: "Array of products in the scene",
        }, {}, {
            val: JSON.stringify(scene.Products),
        });
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `scenes.${scene.SceneID}.run`, {
            name: "run",
            role: "button.play",
            type: "boolean",
            read: true,
            write: true,
            desc: "Shows the running state of a scene. Set to true to run a scene.",
        }, {}, scene.IsRunning);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `scenes.${scene.SceneID}.stop`, {
            name: "stop",
            role: "button.stop",
            type: "boolean",
            read: false,
            write: true,
            desc: "Set to true to stop a running scene.",
        }, {}, false);
        await adapter.setObjectNotExistsAsync(`scenes.${scene.SceneID}.velocity`, {
            type: "state",
            common: {
                name: "velocity",
                role: "value",
                type: "number",
                read: false,
                write: true,
                min: 0,
                max: 0xff,
                desc: "Velocity of the scene.",
                states: {
                    "0": "Default",
                    "1": "Silent",
                    "2": "Fast",
                    "255": "NotAvailable",
                },
                def: 0,
            },
            native: {},
        });
        // Setup scene listeners
        disposableEvents.push(new propertyLink_1.ComplexPropertyChangedHandler(adapter, "IsRunning", scene, async (newValue) => {
            const result = await adapter.setStateAsync(`scenes.${scene.SceneID}.run`, newValue, true);
            if (newValue === false) {
                /*
                    If a running scene was stopped by using the stop state,
                    the stop state should be reset to false.
                */
                await adapter.setStateChangedAsync(`scenes.${scene.SceneID}.stop`, false, true);
            }
            return result;
        }), new propertyLink_1.ComplexPropertyChangedHandler(adapter, "Products", scene, async (newValue) => {
            await adapter.setStateChangedAsync(`scenes.${scene.SceneID}.products`, {
                val: JSON.stringify(newValue),
            }, true);
            return await adapter.setStateChangedAsync(`scenes.${scene.SceneID}.productsCount`, (0, utils_1.ArrayCount)(newValue), true);
        }));
        // Setup state listeners
        const runListener = new propertyLink_1.ComplexStateChangeHandler(adapter, `scenes.${scene.SceneID}.run`, async (state) => {
            var _a;
            if (state !== undefined) {
                if ((state === null || state === void 0 ? void 0 : state.val) === true) {
                    // Acknowledge running state
                    await adapter.setStateAsync(`scenes.${scene.SceneID}.run`, state, true);
                    // Only start the scene if it's not running, already.
                    if (!scene.IsRunning) {
                        // Get the velocity
                        const velocity = (_a = (await adapter.getStateAsync(`scenes.${scene.SceneID}.velocity`))) === null || _a === void 0 ? void 0 : _a.val;
                        // Run the scene
                        await scene.runAsync(velocity);
                    }
                }
            }
        });
        await runListener.Initialize();
        disposableEvents.push(runListener);
        const stopListener = new propertyLink_1.ComplexStateChangeHandler(adapter, `scenes.${scene.SceneID}.stop`, async (state) => {
            if (state !== undefined) {
                if ((state === null || state === void 0 ? void 0 : state.val) === true) {
                    // If the scene is running, acknowledge the stop state and stop the scene.
                    if (scene.IsRunning) {
                        // Acknowledge stop state first
                        await adapter.setStateAsync(`scenes.${scene.SceneID}.stop`, state, true);
                        await scene.stopAsync();
                    }
                    else {
                        // Set the stop state back to false, directly.
                        await adapter.setStateAsync(`scenes.${scene.SceneID}.stop`, false, true);
                    }
                }
            }
        });
        await stopListener.Initialize();
        disposableEvents.push(stopListener);
        const velocityListener = new propertyLink_1.EchoStateChangeHandler(adapter, `scenes.${scene.SceneID}.velocity`);
        await velocityListener.Initialize();
        disposableEvents.push(velocityListener);
        return disposableEvents;
    }
}
exports.SetupScenes = SetupScenes;
//# sourceMappingURL=setupScenes.js.map