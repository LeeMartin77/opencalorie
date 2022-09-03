import { err, ok, Result } from "neverthrow"
import { FoodLogEntry } from "../../types";
import crypto from 'node:crypto'
import { 
    CreateFoodLogEntry,
    DeleteFoodLogFunction,
    EditFoodLogEntry,
    EditFoodLogFunction,
    NotFoundError,
    QueryFoodLogFunction,
    RetrieveFoodLogFunction,
    StorageError,
    StoreFoodLogFunction,
    ValidationError
} from "../types"
import { Client } from 'cassandra-driver'

// Probably worth finding a better way of doing this but we only have one dataset for now
const MIGRATIONS: string[] =[
    "CREATE KEYSPACE IF NOT EXISTS openfooddiary WITH REPLICATION = {'class':'SimpleStrategy','replication_factor':1};", // TODO: Make this optional?
]

const CASSANDRA_CLIENT = new Client({
  contactPoints: process.env.OPENFOODDIARY_CASSANDRA_CONTACT_POINTS ? 
    process.env.OPENFOODDIARY_CASSANDRA_CONTACT_POINTS.split(';') : ['localhost:9042'],
  localDataCenter: process.env.OPENFOODDIARY_CASSANDRA_LOCALDATACENTER ?? 'datacenter1',
  credentials: {
    username: process.env.OPENFOODDIARY_CASSANDRA_USER ?? 'cassandra',
    password: process.env.OPENFOODDIARY_CASSANDRA_PASSWORD ?? 'cassandra'
  }
})

CASSANDRA_CLIENT.connect().then(async () => {
    for(let migration of MIGRATIONS) {
        await CASSANDRA_CLIENT.execute(migration)
    }
})

function isValidCreateLogEntry(logEntry: CreateFoodLogEntry): boolean {
    return (logEntry as any).id === undefined 
        && logEntry.name !== undefined
        && logEntry.labels !== undefined //Check the labels are a set?
        && logEntry.metrics !== undefined
        && !Object.values(logEntry.metrics).some(isNaN)
        && logEntry.time !== undefined
        && logEntry.time.start !== undefined
        && logEntry.time.end !== undefined
        && logEntry.time.end.getTime() >= logEntry.time.start.getTime()
}

function isValidEditLogEntry(logEntry: EditFoodLogEntry): boolean {
    return logEntry.id !== undefined 
        && (logEntry.metrics === undefined || !Object.values(logEntry.metrics).some(isNaN))
        && (logEntry.time === undefined || (
        logEntry.time.start !== undefined
        && logEntry.time.end !== undefined
        && logEntry.time.end.getTime() >= logEntry.time.start.getTime() ))
}


export const storeFoodLog: StoreFoodLogFunction = 
    (userId: string, logEntry: CreateFoodLogEntry) : Promise<Result<string, StorageError>> => {
        if (!isValidCreateLogEntry(logEntry)) {
            return Promise.resolve(err(new ValidationError("Invalid Log Entry")))
        }
        throw new Error("Not Implemented")
    }

export const retrieveFoodLog: RetrieveFoodLogFunction =
    (userId: string, logId: string) : Promise<Result<FoodLogEntry, StorageError>> => {
        throw new Error("Not Implemented")
    }


export const queryFoodLogs: QueryFoodLogFunction =
    (userId: string, startDate: Date, endDate: Date) : Promise<Result<FoodLogEntry[], StorageError>> => {
        if (endDate.getTime() < startDate.getTime()) {
            return Promise.resolve(err(new ValidationError("startDate is after endDate")))
        }
        throw new Error("Not Implemented")
    }

export const editFoodLog: EditFoodLogFunction =
    (userId: string, logEntry: EditFoodLogEntry) => {
        if (!isValidEditLogEntry(logEntry)) {
            return Promise.resolve(err(new ValidationError("Invalid Log Entry")))
        }
        throw new Error("Not Implemented")
    }

export const deleteFoodLog: DeleteFoodLogFunction =
    (userId: string, logId: string): Promise<Result<boolean, StorageError>>  => {
        throw new Error("Not Implemented")
    }