import app from "./app.js";
import { Logger } from "./utils/logger.js";
import { responseHeaderMiddleware } from "./middleware/response-header-middleware.js";
import { rateLimitMiddleware } from "./middleware/rate-limiter.js";
import { ErrorMiddleware } from "./middleware/error-middleware.js";
import baseRouter from "./routes/router.js";
import { env } from "./env.js";

const port = env.PORT ?? 4000;

const logger = new Logger("initServer")

app.use(rateLimitMiddleware)
app.use(responseHeaderMiddleware)

app.use('/api', baseRouter)

app.use(ErrorMiddleware)

app.listen(port, () => {
	logger.info(`API is running on port ${port}`)
})

