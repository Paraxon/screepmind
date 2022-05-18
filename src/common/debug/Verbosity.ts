//https://stackoverflow.com/questions/4874128/what-information-to-include-at-each-log-level?noredirect=1&lq=1
export enum Verbosity {
	/*Used to log an error the application cannot recover from, which might lead
	to an immediate program termination.*/
	Critical = 0,
	/*Denotes an often unrecoverable error. Such as failing to open a database
	connection.*/
	Error,
	/*Warns of errors that can be recovered.Such as failing to parse a date or
	using an unsafe routine.*/
	Warning,
	/*General application flow, such as "Starting app", "connecting to db",
	"registering ...". In short, information which should help any observer
	understand what the application is doing in general.*/
	Info,
	/* Information to primary help you to debug your program. E.g., log every
	time a batching routine empties its batch or a new file is created on disk
	etc.*/
	Debug,
	/*The finest logging level. Can be used to log very specific information
	that is only relevant in a true debugging scenario, e.g., log every database
	access or every HTTP call etc.*/
	Trace
};