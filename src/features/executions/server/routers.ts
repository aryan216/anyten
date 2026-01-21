import prisma from "@/lib/db";
import { createTRPCRouter, protectecProcedure } from "@/trpc/init";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import { ExecutionStatus } from "@/generated/prisma/enums";

export const executionsRouter = createTRPCRouter({
  getMany: protectecProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
        status: z.enum(["PENDING", "RUNNING", "SUCCESS", "ERROR", "CANCELLED"]).nullable().optional(),
        workflowId: z.string().nullable().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, status, workflowId } = input;

      const where: {
        workflow: {
          userId: string;
          name?: { contains: string; mode: "insensitive" };
        };
        status?: ExecutionStatus;
        workflowId?: string;
      } = {
        workflow: {
          userId: ctx.auth.user.id,
        },
      };

      if (search) {
        where.workflow.name = {
          contains: search,
          mode: "insensitive",
        };
      }

      if (status && status !== null) {
        where.status = status as ExecutionStatus;
      }

      if (workflowId && workflowId !== null) {
        where.workflowId = workflowId;
      }

      const [items, totalCount] = await Promise.all([
        prisma.execution.findMany({
          skip: (page - 1) * pageSize,
          take: pageSize,
          where,
          include: {
            workflow: {
              select: {
                id: true,
                name: true,
              },
            },
            _count: {
              select: {
                logs: true,
              },
            },
          },
          orderBy: {
            startedAt: "desc",
          },
        }),
        prisma.execution.count({
          where,
        }),
      ]);

      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),

  getOne: protectecProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const execution = await prisma.execution.findFirstOrThrow({
        where: {
          id: input.id,
          workflow: {
            userId: ctx.auth.user.id,
          },
        },
        include: {
          workflow: {
            select: {
              id: true,
              name: true,
            },
          },
          logs: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      return execution;
    }),
});

