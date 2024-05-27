import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

// https://vitejs.dev/config/
export default defineConfig(({mode}) =>
{
    const env = loadEnv(mode, process.cwd(), '');
    return {
        plugins: [react()],
        define: {
            'process.env': env
        },
        resolve: {
            alias: {
                "@": path.resolve(__dirname, "./src"),
                "#": path.resolve(__dirname, "./public")
            }
        },
        server: {
            host: "0.0.0.0",
            hmr: false,
            port: 8080
        },
        preview: {
            host: "0.0.0.0",
            port: parseInt(process.env.SU_PORT ?? "8080"),
            strictPort: true,
        }
    }
});
