import { Controller, Get } from '@nestjs/common';
import { execSync } from 'child_process';
import * as os from 'os';
import { performance } from 'perf_hooks';
import * as v8 from 'v8';

@Controller('health')
export class HealthController {

  private bytesToMB(bytes: number) {
    return +(bytes / (1024 * 1024)).toFixed(2);
  }

  private formatUptime(seconds: number) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${h}h ${m}m ${s}s`;
  }

  private getGitCommitHash(): string {
    try {
      return execSync('git rev-parse HEAD').toString().trim();
    } catch (e) {
      return 'unknown';
    }
  }

  private measureEventLoopDelay(): Promise<number> {
    const start = performance.now();
    return new Promise((resolve) => {
      setImmediate(() => {
        const end = performance.now();
        resolve(end - start);
      });
    });
  }

  @Get()
  async check() {
    const memoryUsage = process.memoryUsage();
    const uptime = process.uptime();
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const cpus = os.cpus().map((cpu, i) => ({
      core: i,
      model: cpu.model,
      speedMHz: cpu.speed,
      times: cpu.times,
    }));

	let diskUsage: Record<string, any> = {};
	try {
	  const platform = os.platform();
	  if (platform === 'win32') {
		const output = execSync('wmic logicaldisk get DeviceID,Size,FreeSpace /format:csv').toString();
		const lines = output.trim().split('\n').slice(1);
		lines.forEach(line => {
		  const cols = line.split(',');
		  if (cols.length < 4) return;
		  const device = cols[1];
		  const free = Number(cols[2]);
		  const size = Number(cols[3]);
		  if (device) {
			diskUsage[device] = {
			  totalMB: this.bytesToMB(size),
			  freeMB: this.bytesToMB(free),
			  usedMB: this.bytesToMB(size - free),
			  usedPercentage: +(((size - free) / size) * 100).toFixed(2),
			};
		  }
		});
	  } else {
		const df = execSync('df -B1 --output=source,fstype,size,used,avail,target -x tmpfs -x devtmpfs').toString();
		const lines = df.trim().split('\n');
		lines.slice(1).forEach(line => {
		  const cols = line.split(/\s+/);
		  const mount = cols[5];
		  diskUsage[mount] = {
			filesystem: cols[0],
			type: cols[1],
			sizeMB: this.bytesToMB(Number(cols[2])),
			usedMB: this.bytesToMB(Number(cols[3])),
			availableMB: this.bytesToMB(Number(cols[4])),
			usedPercentage: +((Number(cols[3]) / Number(cols[2])) * 100).toFixed(2),
		  };
		});
	  }
	} catch (e) {
	  diskUsage = { error: 'Disk info unavailable' };
	}


    const networkInterfaces = os.networkInterfaces();
    const eventLoopDelay = await this.measureEventLoopDelay();
    const heapStats = v8.getHeapStatistics();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      server: {
        platform: os.platform(),
        arch: os.arch(),
        cpuCores: os.cpus().length,
        uptime: {
          seconds: uptime,
          formatted: this.formatUptime(uptime),
        },
        loadAverage: os.loadavg(),
        memory: {
          system: {
            totalMB: this.bytesToMB(totalMem),
            freeMB: this.bytesToMB(freeMem),
            usedMB: this.bytesToMB(usedMem),
            usedPercentage: +((usedMem / totalMem) * 100).toFixed(2),
          },
          node: {
            rssMB: this.bytesToMB(memoryUsage.rss),
            heapTotalMB: this.bytesToMB(memoryUsage.heapTotal),
            heapUsedMB: this.bytesToMB(memoryUsage.heapUsed),
            heapUsedPercentage: +((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100).toFixed(2),
            externalMB: this.bytesToMB(memoryUsage.external),
            heapStats,
          },
        },
        cpu: {
          perCore: cpus,
        },
        disk: diskUsage,
        network: networkInterfaces,
        eventLoopDelayMS: +eventLoopDelay.toFixed(2),
      },
      nodeVersion: process.version,
      appVersion: process.env.npm_package_version || '1.0.0',
      gitCommit: this.getGitCommitHash(),
    };
  }
}
