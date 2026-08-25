---
title: 数据库映射配置 hack/config.yaml
---

# 数据库映射配置 hack/config.yaml

`hack/config.yaml` 是 [GoFrame gf CLI](https://goframe.org/docs/cli) 脚手架工具的配置文件——它告诉代码生成器**连哪个数据库、按什么规则把表结构映射成 Go 代码**。只在**二次开发 / 源码编译**场景使用，与部署运行无关。

两份 `config.yaml` 的分工：

| | `manifest/config/config.yaml` | `hack/config.yaml` |
|---|---|---|
| **谁在读** | 运行中的 Team-API 进程 | `gf` 代码生成命令 |
| **管什么** | 端口、数据库、Redis、密钥等运行配置 | 生成 dao / do / entity / controller 的规则 |
| **什么时候用** | 部署、日常运行 | 改表结构后重新生成代码 |
| **是否随部署分发** | 是 | 否（仅留在源码仓库） |

::: tip 只部署不开发？
完全不需要关心本文件，请直接阅读[运行配置 config.yaml](/config/config-yaml)。
:::

## 完整配置

以下是仓库 `hack/config.yaml` 的完整内容（模板见 `hack/config.example.yaml`）：

```yaml
# CLI tool configuration, only used in development environment.
# https://goframe.org/docs/cli
gfcli:
  gen:
    dao:
      - link: "pgsql:user:password@tcp(127.0.0.1:5432)/team-api"
        type: "pgsql"
        tables: ""
        tablesEx: ""
        prefix: ""
        removePrefix: ""
        descriptionTag: true
        noModelComment: false
        fieldTag: "json,cbor,yaml,xml,toml"
        jsonCase: "SnakeCase"
        path: "./"
        modelPath: "./internal/model"
        daoPath: "./internal/dao"
        doPath: "./internal/model/do"
        entityPath: "./internal/model/entity"

        # 金额 decimal 化：全局 NUMERIC → decimal.Decimal
        typeMapping:
          decimal:
            type: decimal.Decimal
            import: github.com/shopspring/decimal
          numeric:
            type: decimal.Decimal
            import: github.com/shopspring/decimal

        # 可空金额列 → *decimal.Decimal
        fieldMapping:
          bil_wallets.warning_threshold:
            type: "*decimal.Decimal"
            import: github.com/shopspring/decimal
          # ……其余 9 列见下文表格
    ctrl:
      - apiPath:       "./api"
        outPath:       "./internal/controller"
        withService:   true
        withModel:     false
        merge:         true

  docker:
    build: "-a amd64 -s linux -p temp -ew"
    tagPrefixes:
      - team-api
```

## gen.dao — 数据库映射（核心）

`gf gen dao`（仓库封装为 `make dao`）根据本节配置连接 PostgreSQL，把每张表反向生成为四层 Go 代码：

| 生成物 | 目录 | 用途 |
|---|---|---|
| DAO | `internal/dao/` | 每表一个数据访问对象，链式查询入口（`dao.BilWallets.Ctx(ctx).Where(...)`） |
| DO | `internal/model/do/` | 数据操作对象：字段为指针 + `omitempty`，用于插入 / 更新的入参 |
| Entity | `internal/model/entity/` | 与数据库表 1:1 映射的只读实体 |

### 连接与表筛选

| 配置项 | 示例值 | 说明 |
|---|---|---|
| `link` | `"pgsql:user:password@tcp(host:5432)/team-api"` | 生成代码时连接的**开发库**。与运行配置 `database.default.link` 相互独立——本地开发可指向自己的库，生成结果提交到仓库 |
| `tables` | 空 | 只生成指定表，逗号分隔，支持通配符；**空 = 库中全部表** |
| `tablesEx` | 空 | 排除指定表，与 `tables` 配合使用 |
| `prefix` | 空 | 给生成的结构体名统一加前缀 |
| `removePrefix` | 空 | 生成时去掉表名前缀（如 `t_user` → `User`），多个前缀逗号分隔 |

### 生成规则

| 配置项 | 值 | 说明 |
|---|---|---|
| `descriptionTag` | `true` | 把数据库列注释写入 `description:"…"` tag，同时保留为 Go 代码注释（字段含义双份保留） |
| `noModelComment` | `false` | 是否省略字段注释。保持 `false`，注释是看表的重要信息 |
| `jsonCase` | `"SnakeCase"` | 生成的 `json` tag 命名风格。Team-API 用 `SnakeCase` 让 JSON 字段与数据库列名完全一致 |

`jsonCase` 可选值：`Camel` / `CamelLower`（gf 默认）/ `Snake` / `SnakeScreaming` / `SnakeFirstUpper` / `Kebab` / `KebabScreaming`。

### 输出路径

| 配置项 | 值 | 说明 |
|---|---|---|
| `path` | `"./"` | 生成根目录（`daoPath` 等相对路径的基准） |
| `daoPath` | `"./internal/dao"` | DAO 输出目录 |
| `doPath` | `"./internal/model/do"` | DO 输出目录 |
| `entityPath` | `"./internal/model/entity"` | Entity 输出目录 |

::: warning 三个历史遗留的无效键
`type`、`fieldTag`、`modelPath` **不是 gf CLI 的有效配置键**，会被静默忽略，不影响生成结果：

- 数据库类型由 `link` 的前缀（`pgsql:`）决定，`type` 是冗余项；
- 生成的 tag 固定为 `json` / `orm` / `description`，`fieldTag` 不生效；
- 模型目录由 `doPath` / `entityPath` 决定，`modelPath` 不生效。

照抄模板时保留它们没有副作用，也可以直接删掉。
:::

### typeMapping — 金额字段 decimal 化（重点）

gf CLI 默认把 PostgreSQL 的 `NUMERIC` / `DECIMAL` 列映射为 `float64`。**浮点数存金额会丢精度**（经典的 `0.1 + 0.2 != 0.3`），对一个计费网关来说不可接受。因此全局重映射为 [`shopspring/decimal`](https://github.com/shopspring/decimal)：

```yaml
typeMapping:
  decimal:
    type: decimal.Decimal
    import: github.com/shopspring/decimal
  numeric:
    type: decimal.Decimal
    import: github.com/shopspring/decimal
```

`typeMapping` 的键是**数据库字段类型名**，值是目标 Go 类型及其 import。改这里影响所有表的所有匹配列。

### fieldMapping — 可空金额列指针化

`typeMapping` 解决了精度，还有第二个问题：**可空列**（允许 `NULL` 的金额列）用非指针的 `decimal.Decimal` 无法区分「未设置（NULL）」和「实际为 0」——两者零值相同。对「按次计费价：`NULL` = 未配置（用租户价），`0` = 免费」这类语义，区分不开就是计费 bug。

所以可空金额列逐一映射为 `*decimal.Decimal` 指针，`nil` 即 `NULL`：

| 表.列 | 业务含义 |
|---|---|
| `bil_wallets.warning_threshold` | 钱包余额预警线 |
| `mdl_pricing.per_request_price` | 计费项按次单价 |
| `mdl_tenant_models.custom_input_price` | 租户模型自定义输入价 |
| `mdl_tenant_models.custom_output_price` | 租户模型自定义输出价 |
| `mdl_tenant_models.per_request_price` | 租户模型按次单价 |
| `mdl_tenant_models.custom_cache_read_price` | 缓存读取自定义价 |
| `mdl_tenant_models.custom_cache_creation_price` | 缓存写入自定义价 |
| `mdl_tenant_models.discount_ratio` | 租户模型折扣比例 |
| `api_keys.total_quota` | API Key 总额度 |
| `tnt_projects.budget` | 项目预算 |

### 生成效果

以上配置在 `internal/model/entity/bil_wallets.go` 中的实际产物（节选）：

```go
// BilWallets is the golang structure for table bil_wallets.
type BilWallets struct {
	Id                 int64            `json:"id" orm:"id" description:"主键ID"`
	Balance            decimal.Decimal  `json:"balance" orm:"balance" description:"总余额"`
	WarningThreshold   *decimal.Decimal `json:"warning_threshold" orm:"warning_threshold" description:"余额预警线"`
	CumulativeRecharge decimal.Decimal  `json:"cumulative_recharge" orm:"cumulative_recharge" description:"累计充值总额（USD）"`
	// ……
}
```

对照可见三个配置的效果：金额列为 `decimal.Decimal`、可空预警线为 `*decimal.Decimal`、`json` tag 与列名一致、注释进入 `description` tag。

### 执行生成

```bash
# 前置：安装 gf CLI（GoFrame 脚手架命令行）
go install github.com/gogf/gf/cmd/gf/v2@latest

# 项目内执行（Makefile 封装）
make dao    # = gf gen dao，读取 hack/config.yaml
```

生成文件头部带有 `DO NOT EDIT` 标记，**禁止手动修改**——下次生成会直接覆盖。

## gen.ctrl — 控制器生成

`gf gen ctrl`（`make ctrl`）解析 `api/` 目录下的接口定义（请求 / 响应结构体 + 路由注解），自动生成：

- `api/<module>/v1/` 下的接口 interface 文件；
- `internal/controller/<module>/` 下的控制器骨架——新增接口自动补全方法签名，已实现的方法保留不动。

| 键 | 值 | 说明 |
|---|---|---|
| `merge` | `true` | 同一份 api 定义源文件的所有控制器方法**合并生成到同一个 Go 文件**，而不是每个接口一个文件 |
| `apiPath` / `outPath` / `withService` / `withModel` | — | 历史遗留写法。gf CLI 的实际键名是 `srcFolder`（默认 `api`）与 `dstFolder`（默认 `internal/controller`），当前设置值恰好与默认值一致，因此不影响结果；需要自定义路径时请使用实际键名 |

## docker — 镜像构建参数

| 键 | 值 | 说明 |
|---|---|---|
| `build` | `"-a amd64 -s linux -p temp -ew"` | `gf docker` 构建参数：目标架构 amd64 / 系统 linux、裁剪符号表减小体积 |
| `tagPrefixes` | `team-api` | 构建出的镜像名前缀 |

`make docker-build` 使用，日常 Docker Compose 部署不涉及本节。

## 表结构变更的完整工作流

二次开发中修改表结构的标准流程（配置本文件的目的就在于此）：

```bash
# 1. 编写新的 goose 迁移文件（migrations/ 目录，按版本号递增）

# 2. 在开发库执行迁移
make migrate-up

# 3. 重新生成 dao / do / entity（读取 hack/config.yaml）
make dao

# 4. 如新增了接口定义（api/ 目录），再生成控制器骨架
make ctrl

# 5. 在 internal/logic/ 中实现业务逻辑（生成代码不含业务逻辑）
```

::: warning 不要手改生成产物
`internal/dao`、`internal/model/do`、`internal/model/entity`、`internal/controller` 均为自动生成目录。手工改动会在下次 `make dao` / `make ctrl` 时被覆盖；业务逻辑一律写在 `internal/logic/`。
:::

## 下一步

- [运行配置 config.yaml](/config/config-yaml) —— 部署与运行所需的配置文件
- [源码编译](/deploy/source) —— 从源码构建的完整步骤
