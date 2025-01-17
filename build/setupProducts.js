"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SetupProducts = void 0;
const converter_1 = require("./util/converter");
const propertyLink_1 = require("./util/propertyLink");
const stateHelper_1 = require("./util/stateHelper");
const utils_1 = require("./util/utils");
class SetupProducts {
    static async createProductsAsync(adapter, products) {
        const disposableEvents = [];
        // Remove old products
        const currentProductsList = await adapter.getChannelsOfAsync(`products`);
        adapter.log.debug(`Current Product List: ${JSON.stringify(currentProductsList)}`);
        // Filter current channels to contain only those, that are not present in the provided products list
        const channelsToRemove = currentProductsList.filter((channel) => !products.some((product) => {
            return product.NodeID === Number.parseInt(channel._id.split(".").reverse()[0]);
        }));
        // Delete channels
        for (const channel of channelsToRemove) {
            await adapter.deleteChannelAsync(`products`, channel._id);
        }
        if (channelsToRemove.length !== 0) {
            adapter.log.info(`${channelsToRemove.length} unknown products removed.`);
        }
        for (const product of products) {
            if (product) {
                disposableEvents.push(...(await this.createProductAsync(adapter, product)));
            }
        }
        // Write number of products
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.productsFound`, {
            name: "Number of products found",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            def: 0,
            desc: "Number of products connected to the interface",
        }, {}, (0, utils_1.ArrayCount)(products));
        return disposableEvents;
    }
    static async createProductAsync(adapter, product) {
        const disposableEvents = [];
        adapter.log.info(`Setup objects for product ${product.Name}.`);
        await adapter.setObjectNotExistsAsync(`products.${product.NodeID}`, {
            type: "channel",
            common: {
                name: product.Name,
                role: converter_1.roleConverter.convert(product.TypeID),
            },
            native: {},
        });
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.category`, {
            name: "category",
            role: converter_1.roleConverter.convert(product.TypeID),
            type: "string",
            read: true,
            write: false,
            desc: "Category of the registered product",
        }, {}, product.Category);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.currentPosition`, {
            name: "currentPosition",
            role: converter_1.levelConverter.convert(product.TypeID),
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 100,
            unit: "%",
            desc: "Opening level in percent",
        }, {}, Math.round(product.CurrentPosition * 100));
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.currentPositionRaw`, {
            name: "currentPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Raw value of current position",
        }, {}, product.CurrentPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.FP1CurrentPositionRaw`, {
            name: "FP1CurrentPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Raw value of current position of functional parameter 1",
        }, {}, product.FP1CurrentPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.FP2CurrentPositionRaw`, {
            name: "FP2CurrentPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Raw value of current position of functional parameter 2",
        }, {}, product.FP2CurrentPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.FP3CurrentPositionRaw`, {
            name: "FP3CurrentPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Raw value of current position of functional parameter 3",
        }, {}, product.FP3CurrentPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.FP4CurrentPositionRaw`, {
            name: "FP4CurrentPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Raw value of current position of functional parameter 4",
        }, {}, product.FP4CurrentPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.nodeVariation`, {
            name: "nodeVariation",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Node Variation",
            states: {
                "0": "NotSet",
                "1": "TopHung",
                "2": "Kip",
                "3": "FlatRoof",
                "4": "SkyLight",
            },
        }, {}, product.NodeVariation);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.order`, {
            name: "order",
            role: "value",
            type: "number",
            read: true,
            write: true,
            min: 0,
            max: 0xffff,
            desc: "Custom order of products",
        }, {}, product.Order);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.placement`, {
            name: "placement",
            role: "value",
            type: "number",
            read: true,
            write: true,
            min: 0,
            max: 0xff,
            desc: "Placement (house = 0 or room number)",
        }, {}, product.Placement);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.powerSaveMode`, {
            name: "powerSaveMode",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Power save mode",
            states: {
                "0": "AlwaysAlive",
                "1": "LowPowerMode",
            },
        }, {}, product.PowerSaveMode);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.productType`, {
            name: "productType",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Product type",
        }, {}, product.ProductType);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.remainingTime`, {
            name: "remainingTime",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            unit: "s",
            desc: "Remaining time of current operation in seconds",
        }, {}, product.RemainingTime);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.runStatus`, {
            name: "runStatus",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Current run status",
            states: {
                "0": "ExecutionCompleted",
                "1": "ExecutionFailed",
                "2": "ExecutionActive",
            },
        }, {}, product.RunStatus);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.serialNumber`, {
            name: "serialNumber",
            role: "value",
            type: "string",
            read: true,
            write: false,
            desc: "Serial number",
        }, {}, `${product.SerialNumber.toString("hex").replace(/(..)/g, ":$1").slice(1)}`);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.state`, {
            name: "state",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Operating state",
            states: {
                "0": "NonExecuting",
                "1": "Error",
                "2": "NotUsed",
                "3": "WaitingForPower",
                "4": "Executing",
                "5": "Done",
                "255": "Unknown",
            },
        }, {}, product.State);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.statusReply`, {
            name: "statusReply",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Status reply",
            states: {
                "0": "Unknown",
                "1": "Ok",
                "2": "NoContact",
                "3": "ManuallyOperated",
                "4": "Blocked",
                "5": "WrongSystemKey",
                "6": "PriorityLevelLocked",
                "7": "ReachedWrongPosition",
                "8": "ErrorDuringExecution",
                "9": "NoExecution",
                "10": "Calibrating",
                "11": "PowerConsumptionTooHigh",
                "12": "PowerConsumptionTooLow",
                "13": "LockPositionOpen",
                "14": "MotionTimeTooLongCommunicationEnded",
                "15": "ThermalProtection",
                "16": "ProductNotOperational",
                "17": "FilterMaintenanceNeeded",
                "18": "BatteryLevel",
                "19": "TargetModified",
                "20": "ModeNotImplemented",
                "21": "CommandIncompatibleToMovement",
                "22": "UserAction",
                "23": "DeadBoltError",
                "24": "AutomaticCycleEngaged",
                "25": "WrongLoadConnected",
                "26": "ColourNotReachable",
                "27": "TargetNotReachable",
                "28": "BadIndexReceived",
                "29": "CommandOverruled",
                "30": "NodeWaitingForPower",
                "223": "InformationCode",
                "224": "ParameterLimited",
                "225": "LimitationByLocalUser",
                "226": "LimitationByUser",
                "227": "LimitationByRain",
                "228": "LimitationByTimer",
                "230": "LimitationByUps",
                "231": "LimitationByUnknownDevice",
                "234": "LimitationBySAAC",
                "235": "LimitationByWind",
                "236": "LimitationByMyself",
                "237": "LimitationByAutomaticCycle",
                "238": "LimitationByEmergency",
            },
        }, {}, product.StatusReply);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.subType`, {
            name: "subType",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0b00111111,
            desc: "",
        }, {}, product.SubType);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.targetPosition`, {
            name: "targetPosition",
            role: converter_1.levelConverter.convert(product.TypeID),
            type: "number",
            read: true,
            write: true,
            min: 0,
            max: 100,
            unit: "%",
            desc: "Target opening level in percent. Set this value to move the product to that value, e.g. open a window, move a roller shutter.",
        }, {}, Math.round(product.TargetPosition * 100));
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.targetPositionRaw`, {
            name: "targetPositionRaw",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xffff,
            desc: "Target position raw value",
        }, {}, product.TargetPositionRaw);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.timestamp`, {
            name: "timestamp",
            role: "value",
            type: "string",
            read: true,
            write: false,
            desc: "Timestamp of the last data",
        }, {}, product.TimeStamp.toString());
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.typeID`, {
            name: "typeID",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0b0000001111111111,
            desc: "Product type",
            states: {
                "0": "NO_TYPE",
                "1": "VenetianBlind",
                "2": "RollerShutter",
                "3": "Awning",
                "4": "WindowOpener",
                "5": "GarageOpener",
                "6": "Light",
                "7": "GateOpener",
                "8": "RollingDoorOpener",
                "9": "Lock",
                "10": "Blind",
                "12": "Beacon",
                "13": "DualShutter",
                "14": "HeatingTemperatureInterface",
                "15": "OnOffSwitch",
                "16": "HorizontalAwning",
                "17": "ExternalVentianBlind",
                "18": "LouvreBlind",
                "19": "CurtainTrack",
                "20": "VentilationPoint",
                "21": "ExteriorHeating",
                "22": "HeatPump",
                "23": "IntrusionAlarm",
                "24": "SwingingShutter",
            },
        }, {}, product.TypeID);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.velocity`, {
            name: "velocity",
            role: "value",
            type: "number",
            read: true,
            write: false,
            min: 0,
            max: 0xff,
            desc: "Velocity of the product",
            states: {
                "0": "Default",
                "1": "Silent",
                "2": "Fast",
                "255": "NotAvailable",
            },
        }, {}, product.Velocity);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.stop`, {
            name: "stop",
            role: "button.play",
            type: "boolean",
            read: false,
            write: true,
            desc: "Set to true to stop the current operation",
        }, {}, false);
        await stateHelper_1.StateHelper.createAndSetStateAsync(adapter, `products.${product.NodeID}.wink`, {
            name: "wink",
            role: "button.play",
            type: "boolean",
            read: false,
            write: true,
            desc: "Set to true to let the product wink",
        }, {}, false);
        // Setup product listener
        adapter.log.debug(`Setup change event listeners for product ${product.Name}.`);
        disposableEvents.push(new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.nodeVariation`, "NodeVariation", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.order`, "Order", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.placement`, "Placement", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.state`, "State", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.currentPositionRaw`, "CurrentPositionRaw", product), new propertyLink_1.PercentagePropertyChangedHandler(adapter, `products.${product.NodeID}.currentPosition`, "CurrentPosition", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.targetPositionRaw`, "TargetPositionRaw", product), new propertyLink_1.PercentagePropertyChangedHandler(adapter, `products.${product.NodeID}.targetPosition`, "TargetPosition", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.FP1CurrentPositionRaw`, "FP1CurrentPositionRaw", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.FP2CurrentPositionRaw`, "FP2CurrentPositionRaw", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.FP3CurrentPositionRaw`, "FP3CurrentPositionRaw", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.FP4CurrentPositionRaw`, "FP4CurrentPositionRaw", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.remainingTime`, "RemainingTime", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.timestamp`, "TimeStamp", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.runStatus`, "RunStatus", product), new propertyLink_1.SimplePropertyChangedHandler(adapter, `products.${product.NodeID}.statusReply`, "StatusReply", product));
        adapter.log.debug(`Setup state change listeners for product ${product.Name}.`);
        const nodeVariationHandler = new propertyLink_1.SimpleStateChangeHandler(adapter, `products.${product.NodeID}.nodeVariation`, "NodeVariation", product);
        await nodeVariationHandler.Initialize();
        disposableEvents.push(nodeVariationHandler);
        const orderHandler = new propertyLink_1.SimpleStateChangeHandler(adapter, `products.${product.NodeID}.order`, "Order", product);
        await orderHandler.Initialize();
        disposableEvents.push(orderHandler);
        const placementHandler = new propertyLink_1.SimpleStateChangeHandler(adapter, `products.${product.NodeID}.placement`, "Placement", product);
        await placementHandler.Initialize();
        disposableEvents.push(placementHandler);
        const targetPositionHandler = new propertyLink_1.PercentageStateChangeHandler(adapter, `products.${product.NodeID}.targetPosition`, product, "setTargetPositionAsync");
        await targetPositionHandler.Initialize();
        disposableEvents.push(targetPositionHandler);
        const stopListener = new propertyLink_1.ComplexStateChangeHandler(adapter, `products.${product.NodeID}.stop`, async (state) => {
            if (state !== undefined) {
                if ((state === null || state === void 0 ? void 0 : state.val) === true) {
                    // Acknowledge stop state first
                    await adapter.setStateAsync(`products.${product.NodeID}.stop`, state, true);
                    await product.stopAsync();
                }
            }
        });
        await stopListener.Initialize();
        disposableEvents.push(stopListener);
        const winkListener = new propertyLink_1.ComplexStateChangeHandler(adapter, `products.${product.NodeID}.wink`, async (state) => {
            if (state !== undefined) {
                if ((state === null || state === void 0 ? void 0 : state.val) === true) {
                    // Acknowledge wink state first
                    await adapter.setStateAsync(`products.${product.NodeID}.wink`, state, true);
                    await product.winkAsync();
                }
            }
        });
        await winkListener.Initialize();
        disposableEvents.push(winkListener);
        return disposableEvents;
    }
}
exports.SetupProducts = SetupProducts;
//# sourceMappingURL=setupProducts.js.map