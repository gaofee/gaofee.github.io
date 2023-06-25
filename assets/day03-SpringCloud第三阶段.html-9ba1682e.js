import{ab as l,G as d,H as c,E as e,S as i,N as n,ad as o,ac as a,W as r}from"./framework-251de721.js";const u={},g=a(`<h1 id="学习目标" tabindex="-1"><a class="header-anchor" href="#学习目标" aria-hidden="true">#</a> 学习目标</h1><ul><li>能够知道什么是bus、工作原理，解决了什么问题</li><li>能够使用bus+rabbitmq完成统一配置、自动刷新（客户端、服务端刷新）</li><li>能够知道什么是Sleuth、什么是zipkin</li><li>能够使用zipkin+sleth实现分布式链路追踪</li><li>能够知道什么是Stream消息驱动、工作原理，解决了什么问题</li><li>能够使用Stream将sleth信息存储到rabbitmq</li><li>能够知道什么是Docker、VMware、Docker插件，解决了哪些问题</li><li>能够使用Docker实现微服务部署</li></ul><h1 id="_10-bus消息总线" tabindex="-1"><a class="header-anchor" href="#_10-bus消息总线" aria-hidden="true">#</a> 10 Bus消息总线</h1><h2 id="_10-1-bus概述" tabindex="-1"><a class="header-anchor" href="#_10-1-bus概述" aria-hidden="true">#</a> 10.1 Bus概述</h2><p><strong>1. Bus简介</strong></p><p>Spring Cloud Bus 是用轻量的消息代理将分布式的节点连接起来，可以用于广播配置文件的更改或者服务的监控管理。关键的思想就是，消息总线可以为微服务做监控，也可以实现应用程序之间相通信。</p><p>Spring Cloud Bus 可选的消息代理组建包括RabbitMQ 、AMQP 和 Kafka 等</p><p><strong>2. Bus架构（两种）</strong></p><p>Spring cloud bus通过轻量消息代理连接各个分布的节点，用在广播状态的变化（例如配置变化）或者其他的消息指令，本质是利用了MQ的广播机制在分布式的系统中传播消息，目前常用的有Kafka和RabbitMQ。下面说下使用bus后的两种架构，来看看两者之间的不同：</p><ol><li>客户端刷新：利用消息总线触发一个客户端**/bus/refresh**,而刷新所有客户端的配置：</li></ol><img src="https://gaofee.cc/images/202303171137323.png" alt="1569376265601" style="zoom:67%;"><ol start="2"><li>服务端刷新：使用Config Server的**/bus/refresh**端点，而刷新所有客户端的配置</li></ol><img src="https://gaofee.cc/images/202303171137324.png" alt="1569376301228" style="zoom:67%;"><p>上面两张图都可以实现消息自动刷新的功能，但唯一的不同在于一个更利于操作、更加优雅</p><p><strong>将在快速入门中详细介绍下这两种方式的代码实现</strong>。</p><p><strong>3. 解决了什么问题</strong></p><p>如果有几十个、上百个微服务，而每一个服务又是多实例，当更改配置时，需要重新启动（或者手工执行actuator/refresh进行刷新，当前操作没用到bus）多个微服务实例，会非常麻烦。</p><p>Spring Cloud Bus 就是让这个过程变得简单，当远程Git 仓库的配置更改后，只需要向某一个微服务实例发送一个Post 请求，通过消息组件通知其他微服务实例重新，拉取配置文件。当远程Git 仓库的配置更改后，通过发送“ /bus/refresh ” Post 请求给某一个微服务实例，通过消息组件，通知其他微服务实例，更新配置文件。</p><h2 id="_10-2-bus快速入门" tabindex="-1"><a class="header-anchor" href="#_10-2-bus快速入门" aria-hidden="true">#</a> 10.2 Bus快速入门</h2><p>当前章节沿用了第九章节代码，本次不在叙述下面的代码结构，请直接参照第九章节</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>        &lt;module&gt;config-client&lt;/module&gt;
        &lt;module&gt;config-server&lt;/module&gt;
        &lt;module&gt;eureka-server-config&lt;/module&gt;
        &lt;module&gt;config-client-git&lt;/module&gt;
        &lt;module&gt;config-client-git-backup&lt;/module&gt;
        &lt;module&gt;config-server-git&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>本章节场景：</strong></p><p>由于在第九章无法解决远程仓库文件发生改变，N个微服务同时获取最新值</p><p>所以当前章节将借助RabbitMQ+Spring Cloud Bus实现</p><p>首先启动c</p><p>onfig-client-git配置中心客户端。用于远程仓库码云读取 config-client-git-backup配置中心客户端。用于远程仓库码云读取 config-server-git配置中心客户端。用于配置远程仓库码云</p><p>然后去码云远程仓库修改配置文件</p><p>然后执行【客户端刷新】或者【服务端刷新】，这样的话config-client-git-backup、onfig-client-git都可以获取到最新的值，而不是每个微服务都要执行一次，即使有1000个微服务，执行【客户端刷新】或者【服务端刷新】，这个100微服务都可以刷新。</p><p>itheima-chapter-09,工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171137325.png" alt="1569321599157" tabindex="0" loading="lazy"><figcaption>1569321599157</figcaption></figure><p><strong>1. 引入mq起步依赖</strong></p><p>修改之前的<strong>config-client-git、config-server-git</strong>的pom文件，增加mq起步依赖</p><p>之所以修改上面的两个工程，主要实现客户端或者服务端刷新</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring-cloud-starter-bus-amqp&lt;/artifactId&gt;
        &lt;/dependency&gt;
      &lt;dependency&gt;
	         &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
	         &lt;artifactId&gt;spring-boot-starter-actuator&lt;/artifactId&gt;
&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>2. 修改bootstrap.yml</strong></p><p>修改之前的<strong>config-client-git</strong>的bootstrap.yml文件，加入</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    bus:
      enabled: true #开启spring  cloud bus 服务
      trace: 
        enabled: true #必须设置
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>  rabbitmq:
    host: localhost  #配置RabbitMQ的IP地址
    port: 5672 #配置RabbitMQ的端口
    username: guest #配置RabbitMQ的用户名
    password: guest #配置RabbitMQ的密码
    publisher-confirms: true
    virtual-host: /
 management:
              endpoints:
                web:
                  exposure:
                    include: bus-refresh   #开启刷新端点
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 修改之前的config-server-git的application.yml文件，加入</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>management:
  endpoints:
    web:
      exposure:
        include: bus-refresh,refresh
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>  rabbitmq:
    host: localhost  #配置RabbitMQ的IP地址
    port: 5672 #配置RabbitMQ的端口
    username: guest #配置RabbitMQ的用户名
    password: guest #配置RabbitMQ的密码
    publisher-confirms: true
    virtual-host: /
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 读取配置文件</strong></p><p>在ConfigClientApplication类中写一个API接口，读取配置文件itheima变量，并通过API返回</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@RestController
@EnableEurekaClient
@RefreshScope
public class ConfigClientApplication {

    @Value(&quot;\${itheima}&quot;)
    String itheima;

    public static void main(String[] args) {
        SpringApplication.run(ConfigClientApplication.class, args);
    }

    @RequestMapping(value = &quot;/itheima&quot;)
    public String hi() {
        return itheima;
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 启动</strong></p><p>启动eureka-server-config，config-server-git、config-client-git、config-client-git-backup,如下图：</p><figure><img src="https://gaofee.cc/images/202303171137326.png" alt="1569322793412" tabindex="0" loading="lazy"><figcaption>1569322793412</figcaption></figure><p>上图是Eureka注册web页面，可以看到我们的config-client-git 启动了两个实例，端口分别是8762和8262</p><p>config-server-git为配置服务端，端口为8769</p><figure><img src="https://gaofee.cc/images/202303171137327.png" alt="1569377303292" tabindex="0" loading="lazy"><figcaption>1569377303292</figcaption></figure><p>上图是RabbitMQ的web页面，箭头方向指的是监听我们 Config 配置中心的5672端口</p><figure><img src="https://gaofee.cc/images/202303171137328.png" alt="1569377686721" tabindex="0" loading="lazy"><figcaption>1569377686721</figcaption></figure><p>上图是RabbitMQ的web页面，为我们生成的Queues队列</p><p><strong>6. 设置码云</strong></p>`,54),p={href:"https://gitee.com/code80341157/itheima-repository/tree/master/itheima%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},v=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137329.png",alt:"1569323086443",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323086443")],-1),m=e("p",null,"将config-client-git-dev.yml里面itheima的值修改成itheima config server Version 5.0.1，如下图",-1),b=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137330.png",alt:"1569323148136",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323148136")],-1),h=e("p",null,"然后点击保存即可。",-1),f=e("p",null,[e("strong",null,"7. 客户端刷新")],-1),k={href:"http://localhost:8762/itheima",target:"_blank",rel:"noopener noreferrer"},x={href:"http://localhost:8262/itheima%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},E=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137331.png",alt:"1569323206351",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323206351")],-1),_=e("p",null,"此时发现里面的值还不是最新的，还是之前最早的itheima config server Version 4.0.0",-1),D={start:"2"},S={href:"http://localhost:8762/actuator/bus-refresh",target:"_blank",rel:"noopener noreferrer"},y=e("p",null,"这里采用cmd curl方式，如下图：",-1),q=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137332.png",alt:"1569323378908",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323378908")],-1),I={href:"http://localhost:8262/itheima",target:"_blank",rel:"noopener noreferrer"},C={href:"http://localhost:8762/itheima%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},M=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137333.png",alt:"1569323440933",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323440933")],-1),B=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137334.png",alt:"1569323415310",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569323415310")],-1),A={href:"http://localhost:8762/actuator/bus-refresh",target:"_blank",rel:"noopener noreferrer"},R=e("p",null,"操作，并没有执行端口号为8262的curl操作，而且8262和8762都可以获取到了最新的值itheima config server Version 5.0.1",-1),N=e("p",null,"这样就能很好的给我们解决在大规模的分布式场景中，比如有500个微服务，这个500个微服务都读取了key为itheima的配置，如果配置文件发生了变化，我们只需要通过bus+rabbitmq的方式执行一次，这500个微服务都可以获取到最新的值，而不是手工执行500次操作，大大提高开发和维护的效率",-1),z=e("p",null,[e("strong",null,"8. 服务端刷新")],-1),O=e("p",null,"实现服务端刷新和实现客户端刷新根据 10.2.7章节介绍的步骤全部一样",-1),w=e("strong",null,"唯一不同的是：实现服务端刷新只是在cmd curl 中执行了curl -X POST",-1),T={href:"http://localhost:8769/actuator/bus-refresh%EF%BC%8C**%E6%88%91%E4%BB%ACpost%E8%AF%B7%E6%B1%82%E5%88%B0Config",target:"_blank",rel:"noopener noreferrer"},P=a('<p>如下图：</p><figure><img src="https://gaofee.cc/images/202303171137335.png" alt="1569377097377" tabindex="0" loading="lazy"><figcaption>1569377097377</figcaption></figure><p>服务端刷新、客户端刷新我们都介绍完了，在实际应用中大家可以采用自己喜欢的方式</p><p><strong>推荐使用服务端刷新</strong></p><h2 id="_10-3-总结" tabindex="-1"><a class="header-anchor" href="#_10-3-总结" aria-hidden="true">#</a> 10.3 总结</h2><p>当前章节主要结合上一章Config统一配置中心讲解的Bus总线，Bus总线+RabblitMQ可实现客户端刷新和服务端刷新，客户端刷新是至，通过远程POST访问Config客户端，触发Config Server去远程仓库拉取最新的内容，然后同国内RabbitMQ广播的方式通知更新；而服务端刷新是通过远程POST访问Config服务端，服务端去远程仓库拉取最新的值，然后通过RabbitMQ广播机制通知更新；这也是当前章节重要的核心理念。</p><h1 id="_11-sleuth-zipkin链路追踪" tabindex="-1"><a class="header-anchor" href="#_11-sleuth-zipkin链路追踪" aria-hidden="true">#</a> 11 Sleuth+Zipkin链路追踪</h1><h2 id="_11-1-概述" tabindex="-1"><a class="header-anchor" href="#_11-1-概述" aria-hidden="true">#</a> 11.1 概述</h2><h3 id="_11-1-1-sleuth简介" tabindex="-1"><a class="header-anchor" href="#_11-1-1-sleuth简介" aria-hidden="true">#</a> <strong>11.1.1. Sleuth简介</strong></h3><p><strong>1. Sleuth概念</strong></p><p>Spring-Cloud-Sleuth是Spring Cloud的组成部分之一，为SpringCloud应用实现了一种分布式追踪解决方案，其兼容了Zipkin, HTrace和log-based追踪</p><p>Google开源的 Dapper链路追踪组件，并在2010年发表了论文《Dapper, a Large-Scale Distributed Systems Tracing Infrastructure》，这篇文章是业内实现链路追踪的标杆和理论基础，具有非常大的参考价值。 目前。</p><p>链路追踪组件有Google的Dapper，Twitter 的Zipkin，以及阿里的Eagleeye （鹰眼）等，它们都是非常优秀的链路追踪开源组件。</p><p><strong>2. 为什么需要Sleuth</strong></p><p>微服务架构是一个分布式架构，它按业务划分服务单元，一个分布式系统往往有很多个服务单元。由于服务单元数量众多，业务的复杂性，如果出现了错误和异常，很难去定位。主要体现在，一个请求可能需要调用很多个服务，而内部服务的调用复杂性，决定了问题难以定位。所以微服务架构中，必须实现分布式链路追踪，去跟进一个请求到底有哪些服务参与，参与的顺序又是怎样的，从而达到每个请求的步骤清晰可见，出了问题，很快定位。</p><p>举个例子，在微服务系统中，一个来自用户的请求，请求先达到前端A（如前端界面），然后通过远程调用，达到系统的中间件B、C（如负载均衡、网关等），最后达到后端服务D、E，后端经过一系列的业务逻辑计算最后将数据返回给用户。对于这样一个请求，经历了这么多个服务，怎么样将它的请求过程的数据记录下来呢？这就需要用到服务链路追踪，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137336.png" alt="1569312919274" tabindex="0" loading="lazy"><figcaption>1569312919274</figcaption></figure><p><strong>3. Sleuth解决了什么问题</strong></p>',18),j={href:"https://cloud.tencent.com/product/yuntu?from=10680",target:"_blank",rel:"noopener noreferrer"},U=a(`<table><thead><tr><th>提供链路追踪</th><th>通过sleuth可以很清楚的看出一个请求经过了哪些服务，可以方便的理清服务局的调用关系</th></tr></thead><tbody><tr><td>性能分析</td><td>通过sleuth可以很方便的看出每个采集请求的耗时，分析出哪些服务调用比较耗时，当服务调用的耗时随着请求量的增大而增大时，也可以对服务的扩容提供一定的提醒作用</td></tr><tr><td>数据分析优化链路</td><td>对于频繁地调用一个服务，或者并行地调用等，可以针对业务做一些优化措施</td></tr><tr><td>可视化</td><td>对于程序未捕获的异常，可以在zipkpin界面上看到</td></tr></tbody></table><h3 id="_11-1-2-zipkin简介" tabindex="-1"><a class="header-anchor" href="#_11-1-2-zipkin简介" aria-hidden="true">#</a> 11.1.2. Zipkin简介</h3><p><strong>1.Zipkin概念</strong></p><p>来自Twitte的分布式日志收集工具，分为上传端(spring-cloud-starter-zipkin，集成到项目中)与服务端(独立部署，默认将数据存到内存中)，它可以帮助收集时间数据，解决在microservice架构下的延迟问题；它管理这些数据的收集和查找；Zipkin的设计是基于谷歌的Google Dapper论文。 每个应用程序向Zipkin报告定时数据，Zipkin UI呈现了一个依赖图表来展示多少跟踪请求经过了每个应用程序；如果想解决延迟问题，可以过滤或者排序所有的跟踪请求，并且可以查看每个跟踪请求占总跟踪时间的百分比。</p><p>Zipkin 是一个开放源代码分布式的跟踪系统，每个服务向zipkin报告计时数据，zipkin会根据调用关系通过Zipkin UI生成依赖关系图。</p><p>zipkin提供了可插拔数据存储方式：In-Memory、MySql、Cassandra以及Elasticsear</p><blockquote><p>Zipkin Server分为安装版和构建版</p><p>安装版：下载 Zipkin Server可执行jar</p><p>​ java -jar运行 无需代码构建 （F版本后）</p><p>构建版：引入Zipkin Server起步依赖，入口类开启EnableZipkinServer</p></blockquote><p><strong>2. 基本术语</strong></p><ol><li><p>Span：基本工作单元，例如，在一个新建的span中发送一个RPC等同于发送一个回应请求给RPC，span通过一个64位ID唯一标识，trace以另一个64位ID表示，span还有其他数据信息，比如摘要、时间戳事件、关键值注释(tags)、span的ID、以及进度ID(通常是IP地址) span在不断的启动和停止，同时记录了时间信息，当你创建了一个span，你必须在未来的某个时刻停止它。</p></li><li><p>Trace：一系列spans组成的一个树状结构，例如，如果你正在跑一个分布式大数据工程，你可能需要创建一个trace。</p></li><li><p>Annotation：用来及时记录一个事件的存在，一些核心annotations用来定义一个请求的开始和结束</p><ul><li>cs - Client Sent -客户端发起一个请求，这个annotion描述了这个span的开始</li><li>sr - Server Received -服务端获得请求并准备开始处理它，如果将其sr减去cs时间戳便可得到网络延迟</li><li>ss - Server Sent -注解表明请求处理的完成(当请求返回客户端)，如果ss减去sr时间戳便可得到服务端需要的处理请求时间</li><li>cr - Client Received -表明span的结束，客户端成功接收到服务端的回复，如果cr减去cs时间戳便可得到客户端从服务端获取回复的所有所需时间</li></ul><p>将Span和Trace在一个系统中使用Zipkin注解的过程图形化。如下图：</p></li></ol><figure><img src="https://gaofee.cc/images/202303171137337.png" alt="1569313190789" tabindex="0" loading="lazy"><figcaption>1569313190789</figcaption></figure><h2 id="" tabindex="-1"><a class="header-anchor" href="#" aria-hidden="true">#</a></h2><h2 id="_11-2-sleuth快速入门" tabindex="-1"><a class="header-anchor" href="#_11-2-sleuth快速入门" aria-hidden="true">#</a> 11.2 Sleuth快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立三个个Module，父Module是itheima-chapter-11，里面没有任何代码，它用来管理我们的聚合工程。 eureka-server-sleuth、eureka-client-sleuth代码直接复制第二章节Eureka章节itheima-chapter-02的代码，只是修改了Module名字，其他没有做任何改变。</p><pre><code>    &lt;module&gt;eureka-client-sleuth&lt;/module&gt;
    &lt;module&gt;eureka-server-sleuth&lt;/module&gt;
    &lt;module&gt;eureka-feign-sleuth&lt;/module&gt;
</code></pre><p><strong>具体场景：</strong></p><p>eureka-server-sleuth服务注册发现中心服务端</p><p>eureka-client-sleuth 服务注册中心客户端</p><p>eureka-feign-sleuth集成了sleuth和Zipkin客户端</p><p>启动Zipkin服务端、启动eureka-server-sleuth，将eureka-client-sleuth 、eureka-feign-sleuth注册到服务端</p><p>然后通过Zipkin查看链路追踪信息和服务依赖</p><p>章节代码：itheima-chapter-11如下图：</p><figure><img src="https://gaofee.cc/images/202303171137338.png" alt="1569323847483" tabindex="0" loading="lazy"><figcaption>1569323847483</figcaption></figure><p><strong>1. 创建Sleuth模块</strong></p><p>创建工程eureka-feign-sleuth</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>	&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
			&lt;artifactId&gt;spring-boot-starter-actuator&lt;/artifactId&gt;
		&lt;/dependency&gt;

		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-sleuth&lt;/artifactId&gt;
		&lt;/dependency&gt;
		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-zipkin&lt;/artifactId&gt;
		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>spring-cloud-starter-zipkin为zipkin客户端的起步依赖</p><p>spring-cloud-starter-sleuth为sleuth的起步依赖</p><p>spring-boot-starter-actuato为监控的起步依赖</p><p><strong>3. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  sleuth:
    sampler:
      probability: 1.0 # 将采样比例设置为 1.0，也就是全部都需要。默认是 0.1
  zipkin:
    base-url: http://localhost:9411/ # 指定了 Zipkin 服务器的地址

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>probability:将采样比例设置为 1.0，也就是全部都需要。默认是 0.1，由于分布式系统的请求量一般比较大，不可能把所有的请求链路进行收集整理，因此sleuth采用抽样收集的方式，设定一个抽样百分比。在开发阶段，我们一般设定百分比为100%也就是1</p><p>base-url:Zipkin 服务器的地址</p><p><strong>4. 启动</strong></p><p>启动eureka-server-sleuth模块根目录下的Zipkin Server，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137339.png" alt="1569317252885" tabindex="0" loading="lazy"><figcaption>1569317252885</figcaption></figure>`,37),V={href:"http://localhost:9411/zipkin/",target:"_blank",rel:"noopener noreferrer"},F=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137340.png",alt:"1569319368467",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569319368467")],-1),Q=e("p",null,"启动eureka-server-sleuth、eureka-client-sleuth、启动eureka-feign-sleuth，如下图：",-1),L=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137341.png",alt:"1569319334911",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569319334911")],-1),Z=e("p",null,[e("strong",null,"5. 查看链路追踪")],-1),H={href:"http://localhost:8765/hi%E8%AE%BF%E9%97%AE**EUREKA-FEIGN-SLEUTH**%E6%9C%8D%E5%8A%A1%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},G=a(`<figure><img src="https://gaofee.cc/images/202303171137342.png" alt="1569319485588" tabindex="0" loading="lazy"><figcaption>1569319485588</figcaption></figure><p>此时，在查看Zipkin Web页面，查看链路追踪数据，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137343.png" alt="1569319544053" tabindex="0" loading="lazy"><figcaption>1569319544053</figcaption></figure><p>可以根据服务名进行搜索查询，比如点击服务名为eureka-client-sleuth，如下图</p><figure><img src="https://gaofee.cc/images/202303171137344.png" alt="1569319833708" tabindex="0" loading="lazy"><figcaption>1569319833708</figcaption></figure><p>至此，只查eureka-client-sleuth调用链路数据，点击link（箭头方向）</p><figure><img src="https://gaofee.cc/images/202303171137345.png" alt="1569319878142" tabindex="0" loading="lazy"><figcaption>1569319878142</figcaption></figure><p>点击link出现了详细信息，如下图</p><figure><img src="https://gaofee.cc/images/202303171137346.png" alt="1569319926092" tabindex="0" loading="lazy"><figcaption>1569319926092</figcaption></figure><p>除了可以查看服务链路信息为，zipkin还可以查看服务依赖情况，点击【依赖】，如下图</p><figure><img src="https://gaofee.cc/images/202303171137347.png" alt="1569319999012" tabindex="0" loading="lazy"><figcaption>1569319999012</figcaption></figure><p>点击【依赖】，展示依赖详情，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137348.png" alt="1569320029103" tabindex="0" loading="lazy"><figcaption>1569320029103</figcaption></figure><h2 id="_11-3-总结" tabindex="-1"><a class="header-anchor" href="#_11-3-总结" aria-hidden="true">#</a> 11.3 总结</h2><p>通过Sleuth搜集服务调用链路，集成Zipkin作为链路追踪的UI展示，当前章节主要介绍了Zipkin的使用方式，推荐使用安装版，在当前章节中定义了三个服务，一个服务注册中心、一个注册中心客户端，然后通过Feign调用远程服务，Sleuth去搜集调用信息并在Zipkin中展示</p><h1 id="_12-stream消息驱动" tabindex="-1"><a class="header-anchor" href="#_12-stream消息驱动" aria-hidden="true">#</a> 12 Stream消息驱动</h1><h2 id="_12-1-stream概述" tabindex="-1"><a class="header-anchor" href="#_12-1-stream概述" aria-hidden="true">#</a> 12.1 Stream概述</h2><p><strong>1. Stream简介</strong></p><p><strong>Spring Cloud Stream</strong>是一个构建消息驱动微服务应用的框架。它基于<strong>Spring Boot</strong>构建独立的、生产级的<strong>Spring</strong>应用，并使用<strong>Spring Integration</strong>为消息代理提供链接。</p><p><strong>2. Stream工作原理</strong></p><figure><img src="https://gaofee.cc/images/202303171137349.png" alt="1569378168922" tabindex="0" loading="lazy"><figcaption>1569378168922</figcaption></figure><p>Spring Cloud Stream应用由第三方的中间件组成。应用间的通信通过输入通道（input channel）和输出通道（output channel）完成。这些通道是有Spring Cloud Stream 注入的。而通道与外部的代理（可以理解为上文所说的数据中心）的连接又是通过Binder实现的.</p><p>Spring Cloud Stream目前支持两种消息中间件RabbitMQ和Kafka</p><p><strong>3. Stream解决了哪些问题</strong></p><p>Stream解决了开发人员无感知的使用消息中间件的问题，因为Stream对消息中间件的进一步封装，可以做到代码层面对中间件的无感知，甚至于动态的切换中间件(rabbitmq切换为kafka)，使得微服务开发的高度解耦，服务可以关注更多自己的业务流程</p><p>异步(消息的发送方, 只需要发送一条消息出去, 就可以不管了, 至于怎处理, 则交给消息的订阅者去处理)</p><p>应用解耦(发布者和订阅者相互间解耦)</p><h2 id="_12-2-stream核心概念" tabindex="-1"><a class="header-anchor" href="#_12-2-stream核心概念" aria-hidden="true">#</a> 12.2 Stream核心概念</h2><p><strong>1. 发布, 订阅模式</strong></p><p>如下图是经典的Spring Cloud Stream的 发布-订阅 模型，生产者 生产消息发布在shared topic（共享主题）上，然后 消费者 通过订阅这个topic来获取消息</p><img src="https://gaofee.cc/images/202303171137350.png" alt="1569378632717" style="zoom:50%;"><p><strong>2. 消费组</strong></p><p>尽管发布-订阅 模型通过共享的topic连接应用变得很容易，但是通过创建特定应用的多个实例的来扩展服务的能力同样重要，但是如果这些实例都去消费这条数据，那么很可能会出现重复消费的问题，我们只需要同一应用中只有一个实例消费该消息，这时我们可以通过消费组来解决这种应用场景， <strong>当一个应用程序不同实例放置在一个具有竞争关系的消费组中，组里面的实例中只有一个能够消费消息</strong></p><img src="https://gaofee.cc/images/202303171137351.png" alt="1569378680176" style="zoom:50%;"><p><strong>3. 消息分区</strong></p><p>在消费组中我们可以保证消息不会被重复消费，但是在同组下有多个实例的时候，我们无法确定每次处理消息的是不是被同一消费者消费，分区的作用就是为了<strong>确保具有共同特征标识的数据由同一个消费者实例进行处理</strong>，当然前边的例子是狭义的，通信代理（broken topic）也可以被理解为进行了同样的分区划分。Spring Cloud Stream 的分区概念是抽象的，可以为不支持分区Binder实现（例如RabbitMQ）也可以使用分区。</p><img src="https://gaofee.cc/images/202303171137352.png" alt="1569378513772" style="zoom:67%;"><p><strong>4. Stream应用模型</strong></p><p>应用程序通过 inputs 或者 outputs 来与 Spring Cloud Stream 中Binder 交互，通过我们配置来绑定，而 Spring Cloud Stream 的 Binder 负责与中间件交互。所以，我们只需要搞清楚如何与 Spring Cloud Stream 交互就可以方便使用消息驱动的方式。</p><img src="https://gaofee.cc/images/202303171137353.png" alt="1569378775802" style="zoom:50%;"><p><strong>抽象绑定器（The Binder Abstraction）</strong></p><p>Spring Cloud Stream实现Kafkat和RabbitMQ的Binder实现，也包括了一个TestSupportBinder，用于测试。你也可以写根据API去写自己的Binder.</p><p>Spring Cloud Stream 同样使用了Spring boot的自动配置，并且抽象的Binder使Spring Cloud Stream的应用获得更好的灵活性，比如：我们可以在application.yml或application.properties中指定参数进行配置使用Kafka或者RabbitMQ，而无需修改我们的代码</p><p><strong>5. Stream编程模型</strong></p><ul><li><strong>Destination Binders（目的地绑定器）</strong>： 负责与外部消息系统集成交互的组件</li><li><strong>Destination Bindings（目的地绑定）</strong>： 在外部消息系统和应用的生产者和消费者之间的桥梁（由Destination Binders创建）</li><li><strong>Message （消息）</strong>： 用于生产者、消费者通过Destination Binders沟通的规范数据。</li></ul><ol><li><p><strong>Destination Binders（目的地绑定器）</strong>：</p><p>Destination Binders是Spring Cloud Stream与外部消息中间件提供了必要的配置和实现促进集成的扩展组件。集成了生产者和消费者的消息的路由、连接和委托、数据类型转换、用户代码调用等。</p><p>尽管Binders帮我们处理了许多事情，我们仍需要对他进行配置。之后会讲</p></li><li><p><strong>Destination Bindings （目的地绑定）</strong> ：</p><p>如前所述，Destination Bindings 提供连接外部消息中间件和应用提供的生产者和消费者中间的桥梁。</p><p>使用@EnableBinding 注解打在一个配置类上来定义一个Destination Binding，这个注解本身包含有@Configuration，会触发Spring Cloud Stream的基本配置</p></li></ol><h2 id="_12-3-stream快速入门" tabindex="-1"><a class="header-anchor" href="#_12-3-stream快速入门" aria-hidden="true">#</a> 12.3 Stream快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立三个个Module，父Module是itheima-chapter-12，里面没有任何代码，它用来管理我们的聚合工程。</p><p>本章节将采取RabbitMQ+Stream实现消息的发送和消息的接收以及如何处理重复消费</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>        &lt;module&gt;stream-consumer-rabbitmq&lt;/module&gt;
        &lt;module&gt;stream-producer-rabbitmq&lt;/module&gt;
        &lt;module&gt;stream-consumer-rabbitmq-backup&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>具体场景</strong></p><p>stream-producer-rabbitmq生产消息，将消息发送到RabbitMQ</p><p>stream-consumer-rabbitmq去RabbitMQ上面消费消息</p><p>为了验证重复消费，我们又加了个Module 模块stream-consumer-rabbitmq-backup去验证重复消费</p><p>本章节代码：itheima-chapter-12，工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171137354.png" alt="1569407197608" tabindex="0" loading="lazy"><figcaption>1569407197608</figcaption></figure><h3 id="_12-3-1-创建生产者" tabindex="-1"><a class="header-anchor" href="#_12-3-1-创建生产者" aria-hidden="true">#</a> <strong>12.3.1 创建生产者</strong></h3><p>创建模块stream-producer-rabbitmq（消息生产者），作为Stream的生产者，主要作用是应用程序通过管道向RabbitMQ发送消息</p><p><strong>1. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
			&lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
		&lt;/dependency&gt;
		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-stream-rabbit&lt;/artifactId&gt;
		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><code>Stream</code>依赖RabbitMQ、绑定器，所以需要引入spring-cloud-starter-stream-rabbit起步依赖</p><p><strong>2. 修改application.yml文件</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#客户端连接的地址，有多个的时候使用逗号分隔，该地址可以是IP与Port的结合
spring.rabbitmq.addresses=amqp://127.0.0.1:5672
#rabbit用户名
spring.rabbitmq.username=guest
#rabbit密码
spring.rabbitmq.password=guest
#目的地绑定器
spring.cloud.stream.bindings.producerChannel.destination =itheimaBind
server.port=8080
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 创建通道绑定（Output）</strong></p><p>消息从发布者传递到队列的整个过程是通过通道完成的。</p><p>因此，我们创建一个MessageChannelOutputBinding接口，其中包含我们的消息机制<code>producerChannel</code>:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>interface MessageChannelOutputBinding {
    /**
     * 消息从发布者传递到队列的整个过程是通过通道完成的。因此，
     * 让我们创建一个接口，其中包含我们的消息机制producerChannel
     * 因为这将发布消息，所以我们使用@Output注解。方法名可以是我们想要的任意名称，
     * 当然，我们可以在一个接口中有多个Channel(通道)
     *
     * @return
     */
    @Output(&quot;producerChannel&quot;)
    MessageChannel producerChannel();

}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 消息推送（Output）</strong></p><p>创建rest接口，将消息发送到RabbitMQ</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@RestController
public class ProducerOutputController {

    private MessageChannel greet;

    public ProducerOutputController(MessageChannelOutputBinding binding) {
        greet = binding.greeting();
    }

    /**
     * 将消息推送到这个Channel(通道)
     * 单的REST接口，它接收PathVariable的name，并使用MessageBuilder创建一个String类型的消息。
     * 后，我们使用MessageChannel上的.send()方法来发布消息。
     *
     * @param name
     */
    @GetMapping(&quot;/greet/{name}&quot;)
    public void publish(@PathVariable String name) {
        String greeting = &quot;Hello, &quot; + name + &quot;!&quot;;
        Message&lt;String&gt; msg = MessageBuilder.withPayload(greeting)
                .build();
        this.greet.send(msg);
    }

}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 生产者入口</strong></p><p>生产者的入口程序</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 主类中添加@EnableBinding注解，
 * 传入MessageChannelOutputBinding告诉Spring加载
 */
@EnableBinding(MessageChannelOutputBinding.class)
@SpringBootApplication
public class PorducerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PorducerApplication.class, args);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_12-3-2-创建消费者" tabindex="-1"><a class="header-anchor" href="#_12-3-2-创建消费者" aria-hidden="true">#</a> 12.3.2 创建消费者</h3><p>创建模块stream-consumer-rabbitmq，作为Stream的消费者，Stream将通过管道订阅RabbitMQ上面的数据</p><p><strong>1. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
			&lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
		&lt;/dependency&gt;
		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-stream-rabbit&lt;/artifactId&gt;
		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>2. 修改application.yml文件</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#客户端连接的地址，有多个的时候使用逗号分隔，该地址可以是IP与Port的结合
spring.rabbitmq.addresses=amqp://127.0.0.1:5672
#rabbit用户名
spring.rabbitmq.username=guest
#rabbit密码
spring.rabbitmq.password=guest
#目的地绑定器（基础信息生产）
spring.cloud.stream.bindings.producerChannel.destination=itheimaBind
server.port=9090
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 创建通道绑定（Input）</strong></p><p>需要监听之前创建的通道producerChannel为它创建一个绑定</p><p>与生产者绑定的两个非常明显区别。因为我们正在消费消息，所以我们使用<code>SubscribableChannel</code>和<code>@Input</code>注解连接到producerChannel</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 需要监听之前创建的通道greetingChannel为它创建一个绑定
 * &lt;p&gt;
 * 与生产者绑定的两个非常明显区别。因为我们正在消费消息
 * ，所以我们使用SubscribableChannel和@Input注解连接到gproducerChannel
 * 消息数据将被推送这里
 */
public interface MessageChannelInputBinding {

    String GREETING = &quot;producerChannel&quot;;

    @Input(GREETING)
    SubscribableChannel producerChannel();

}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 消息消费</strong></p><p>利用元注解StreamListener参数为MessageChannelInputBinding，用SubscribableChannel和@Input注解连接到producerChannel（RabbitMQ）,在RabbitMQ上进行消费</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 添加@EnableBinding启用了MessageChannelInputBinding
 */
@EnableBinding(MessageChannelInputBinding.class)
public class MessageConsumerListener {
    /**
     * 创建处理数据的方法
     * 从mq消费消息，然后消息输出
     *
     * @param msg
     */
    @StreamListener(target = MessageChannelInputBinding.GREETING)
    public void processHelloChannelGreeting(String msg) {
        System.out.println(msg);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 消费者入口</strong></p><p>消息消费的入口程序</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
public class ConsumerApplication {

    public static void main(String[] args) {

        SpringApplication.run(ConsumerApplication.class, args);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 启动</strong></p><p>**注意：**stream-consumer-rabbitmq-backup工程：复制stream-consumer-rabbitmq，修改下application.yml里面的server.port为其他端口即可，创建过程不再赘述</p><p>启动stream-producer-rabbitmq、stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup、RabbitMQ</p><p><strong>7. 访问</strong></p><ol><li>访问RabbitMQ浏览器输入 确保可以正常访问，如下图：</li></ol><figure><img src="https://gaofee.cc/images/202303171137355.png" alt="1569390296360" tabindex="0" loading="lazy"><figcaption>1569390296360</figcaption></figure>`,96),Y={start:"2"},K=e("code",null,"REST",-1),W={href:"http://localhost:8080/greet/itheima",target:"_blank",rel:"noopener noreferrer"},X=a(`<figure><img src="https://gaofee.cc/images/202303171137356.png" alt="1569390514326" tabindex="0" loading="lazy"><figcaption>1569390514326</figcaption></figure><p>接着查看<strong>stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup</strong>的IDEA控制台,显示如下</p><figure><img src="https://gaofee.cc/images/202303171137357.png" alt="1569406466930" tabindex="0" loading="lazy"><figcaption>1569406466930</figcaption></figure><figure><img src="https://gaofee.cc/images/202303171137358.png" alt="1569406512179" tabindex="0" loading="lazy"><figcaption>1569406512179</figcaption></figure><p>当我们点击生产者<code>REST</code>端点生产消息时，我们看到两个消费者(<strong>stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup</strong>)都收到了消息，这可能是我们在一些用例中想要的。但是，如果我们只想让一个消费者消费一条消息呢?为此，我们需要在<code>application.properties</code>中创建一个消费者组。增加消费者的配置文件:</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#默认情况下同一个队列的只能被同一个group的消费者消费
spring.cloud.stream.bindings.producerChannel.group=itheimaBind-group
#需要注意上述配置中producerChannel是在代码中@Output和@Input中传入的名字
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>现在，我们在重启<strong>stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup</strong>工程</p>`,7),$=e("code",null,"REST",-1),J={href:"http://localhost:8080/greet/itheima",target:"_blank",rel:"noopener noreferrer"},ee=a('<figure><img src="https://gaofee.cc/images/202303171137359.png" alt="1569406655139" tabindex="0" loading="lazy"><figcaption>1569406655139</figcaption></figure><p>查看<strong>stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup</strong>控制台输出，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137360.png" alt="1569406696331" tabindex="0" loading="lazy"><figcaption>1569406696331</figcaption></figure><figure><img src="https://gaofee.cc/images/202303171137361.png" alt="1569406730179" tabindex="0" loading="lazy"><figcaption>1569406730179</figcaption></figure><p>此时我们发现两个消费者（<strong>stream-consumer-rabbitmq、stream-consumer-rabbitmq-backup</strong>）只有一个</p><p>消费者（stream-consumer-rabbitmq，端口为9090）消费了消息，<strong>成功解决了重复消费问题</strong></p><p>查看RabbitMQ web页面交换器（Exchanges）itheimaBind，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137362.png" alt="1569406981742" tabindex="0" loading="lazy"><figcaption>1569406981742</figcaption></figure><p>上图的交换器itheima是我们生产者消费者对应的目的绑定器</p><p>查看RabbitMQ web页面交换器（Queues）itheimaBind，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137364.png" alt="1569407054011" tabindex="0" loading="lazy"><figcaption>1569407054011</figcaption></figure><p>上图RabbitMQ对应的Queues队列，对应我们消费者配置文件消费组，他也是解决重复消费的关键所在</p><p>重复消费总结：**</p><p>当我们指定了某个绑定所指向的消费组之后，往当前主题发送的消息在每个订阅消费组中，只会有一个订阅者接收和消费，从而实现了对消息的负载均衡。只所以之前会出现重复消费的问题，是由于默认情况下，任何订阅都会产生一个匿名消费组，所以每个订阅实例都会有自己的消费组，从而当有消息发送的时候，就形成了广播的模式</p><blockquote><p>第十一章总结：本章主要讲解了什么是Stream、他的工作原理和解决了工作上遇到的那些问题，结合案例解释了消息传递的主要概念、它在微服务中的角色以及如何使用<code>Spring Cloud Stream</code>实现它。我们使用<code>RabbitMQ</code>作为消息代理，如何实现生产者、和消费者利用消息代理进行消息的传递</p></blockquote><h2 id="_12-4-总结" tabindex="-1"><a class="header-anchor" href="#_12-4-总结" aria-hidden="true">#</a> 12.4 总结</h2><p>当前章节主要讲解了Stream消息驱动的使用场景以及为我们解决了哪些问题，比如，我们在开发应用程序的时候，有很多微服务、或者是经过整合、拆分遗留下来的，有的微服务使用的消息中间件不同，有的使用了RabbitMQ或者kafak，如果程序不停的和消息中间件进行适配，会消耗我们很多的精力</p><p>应用程序通过 inputs 或者 outputs 来与 Spring Cloud Stream 中Binder 交互，通过我们配置来绑定，而 Spring Cloud Stream 的 Binder 负责与中间件交互。所以，我们只需要搞清楚如何与 Spring Cloud Stream 交互就可以方便使用消息驱动的方式</p><p>一进一出，Stream全部都帮助我们做了，如果后续需要更换消息中间件，我们只需要简单的配置下，就可以完全实现，而不是大量的去写业务系统代码与MQ交互的逻辑。</p><h1 id="_13-微服务docker部署" tabindex="-1"><a class="header-anchor" href="#_13-微服务docker部署" aria-hidden="true">#</a> 13 微服务Docker部署</h1><h2 id="_13-1-docker概述" tabindex="-1"><a class="header-anchor" href="#_13-1-docker概述" aria-hidden="true">#</a> 13.1 Docker概述</h2><p><strong>本章节主要讲解微服务在Docker中如何部署、运行，这是当前章节的重点</strong></p><p><strong>Docker目前是安装在了VMware虚拟机上，方便我们测试</strong>。</p><p><strong>关于Docker下载、安装、配置、镜像管理、服务编排、常用命令等不在赘述，具体请参照Docker专题</strong></p><p><strong>1. Docker简介</strong></p><img src="https://gaofee.cc/images/202303171137365.png" alt="1569407287803" style="zoom:50%;">',26),ie={href:"https://baike.baidu.com/item/%E5%BC%80%E6%BA%90/246339",target:"_blank",rel:"noopener noreferrer"},ne={href:"https://baike.baidu.com/item/Linux",target:"_blank",rel:"noopener noreferrer"},te={href:"https://baike.baidu.com/item/%E8%99%9A%E6%8B%9F%E5%8C%96/547949",target:"_blank",rel:"noopener noreferrer"},ae={href:"https://baike.baidu.com/item/%E6%B2%99%E7%AE%B1/393318",target:"_blank",rel:"noopener noreferrer"},re=a(`<p><strong>2. 什么是Dockerfile</strong></p><p>Dockerfile是一个包含用于组合映像的命令的文本文档。可以使用在命令行中调用任何命令。 Docker通过读取<code>Dockerfile</code>中的指令自动生成映像。</p><h2 id="_13-2-dockerfile文件说明" tabindex="-1"><a class="header-anchor" href="#_13-2-dockerfile文件说明" aria-hidden="true">#</a> <strong>13.2 Dockerfile文件说明</strong></h2><p>Docker以从上到下的顺序运行Dockerfile的指令。为了指定基本映像，第一条指令必须是<em>FROM</em>。一个声明以<code>＃</code>字符开头则被视为注释。可以在Docker文件中使用<code>RUN</code>，<code>CMD</code>，<code>FROM</code>，<code>EXPOSE</code>，<code>ENV</code>等指令。</p><p><strong>FROM：指定基础镜像，必须为第一个命令</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
　　FROM &lt;image&gt;
　　FROM &lt;image&gt;:&lt;tag&gt;
　　FROM &lt;image&gt;@&lt;digest&gt;
示例：
　　FROM mysql:5.6
注：
　　tag或digest是可选的，如果不使用这两个值时，会使用latest版本的基础镜像
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>MAINTAINER: 维护者信息</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    MAINTAINER &lt;name&gt;
示例：
    MAINTAINER itheima
    MAINTAINER itheima@itcast.com 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>RUN：构建镜像时执行的命令</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>RUN用于在镜像容器中执行命令，其有以下两种命令执行方式：
shell执行
格式：
    RUN &lt;command&gt;
exec执行
格式：
    RUN [&quot;executable&quot;, &quot;param1&quot;, &quot;param2&quot;]
示例：
    RUN [&quot;executable&quot;, &quot;param1&quot;, &quot;param2&quot;]
    RUN apk update
    RUN [&quot;/etc/execfile&quot;, &quot;arg1&quot;, &quot;arg1&quot;]
注：
　　RUN指令创建的中间镜像会被缓存，并会在下次构建中使用。如果不想使用这些缓存镜像，可以在构建时指定--no-cache参数，如：docker build --no-cache
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ADD：将本地文件添加到容器中，tar类型文件会自动解压(网络压缩资源不会被解压)，可以访问网络资源，类似wget</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    ADD &lt;src&gt;... &lt;dest&gt;
    ADD [&quot;&lt;src&gt;&quot;,... &quot;&lt;dest&gt;&quot;] 用于支持包含空格的路径
示例：
    ADD hom* /mydir/          # 添加所有以&quot;hom&quot;开头的文件
    ADD hom?.txt /mydir/      # ? 替代一个单字符,例如：&quot;home.txt&quot;
    ADD test relativeDir/     # 添加 &quot;test&quot; 到 \`WORKDIR\`/relativeDir/
    ADD test /absoluteDir/    # 添加 &quot;test&quot; 到 /absoluteDir/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>COPY：功能类似ADD，但是是不会自动解压文件，也不能访问网络资源</strong></p><p><strong>CMD：构建容器后调用，也就是在容器启动时才进行调用</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    CMD [&quot;executable&quot;,&quot;param1&quot;,&quot;param2&quot;] (执行可执行文件，优先)
    CMD [&quot;param1&quot;,&quot;param2&quot;] (设置了ENTRYPOINT，则直接调用ENTRYPOINT添加参数)
    CMD command param1 param2 (执行shell内部命令)
示例：
    CMD echo &quot;This is a test.&quot; | wc -
    CMD [&quot;/usr/bin/wc&quot;,&quot;--help&quot;]
注：
 　　CMD不同于RUN，CMD用于指定在容器启动时所要执行的命令，而RUN用于指定镜像构建时所要执行的命令。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ENTRYPOINT：配置容器，使其可执行化。配合CMD可省去&quot;application&quot;，只使用参数</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    ENTRYPOINT [&quot;executable&quot;, &quot;param1&quot;, &quot;param2&quot;] (可执行文件, 优先)
    ENTRYPOINT command param1 param2 (shell内部命令)
示例：
    FROM ubuntu
    ENTRYPOINT [&quot;top&quot;, &quot;-b&quot;]
    CMD [&quot;-c&quot;]
注：
　　　ENTRYPOINT与CMD非常类似，不同的是通过docker run执行的命令不会覆盖ENTRYPOINT，而docker run命令中指定的任何参数，都会被当做参数再次传递给ENTRYPOINT。Dockerfile中只允许有一个ENTRYPOINT命令，多指定时会覆盖前面的设置，而只执行最后的ENTRYPOINT指令。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>LABEL：用于为镜像添加元数据</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    LABEL &lt;key&gt;=&lt;value&gt; &lt;key&gt;=&lt;value&gt; &lt;key&gt;=&lt;value&gt; ...
示例：
　　LABEL version=&quot;1.0&quot; description=&quot;这是一个Web服务器&quot; by=&quot;IT笔录&quot;
注：
　　使用LABEL指定元数据时，一条LABEL指定可以指定一或多条元数据，指定多条元数据时不同元数据之间通过空格分隔。推荐将所有的元数据通过一条LABEL指令指定，以免生成过多的中间镜像。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ENV：设置环境变量</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    ENV &lt;key&gt; &lt;value&gt;  #&lt;key&gt;之后的所有内容均会被视为其&lt;value&gt;的组成部分，因此，一次只能设置一个变量
    ENV &lt;key&gt;=&lt;value&gt; ...  #可以设置多个变量，每个变量为一个&quot;&lt;key&gt;=&lt;value&gt;&quot;的键值对，如果&lt;key&gt;中包含空格，可以使用\\来进行转义，也可以通过&quot;&quot;来进行标示；另外，反斜线也可以用于续行
示例：
    ENV myName John Doe
    ENV myDog Rex The Dog
    ENV myCat=fluffy
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>EXPOSE：指定于外界交互的端口</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    EXPOSE &lt;port&gt; [&lt;port&gt;...]
示例：
    EXPOSE 80 443
    EXPOSE 8080
    EXPOSE 11211/tcp 11211/udp
注：
　　EXPOSE并不会让容器的端口访问到主机。要使其可访问，需要在docker run运行容器时通过-p来发布这些端口，或通过-P参数来发布EXPOSE导出的所有端口
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>VOLUME：用于指定持久化目录</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    VOLUME [&quot;/path/to/dir&quot;]
示例：
    VOLUME [&quot;/data&quot;]
    VOLUME [&quot;/var/www&quot;, &quot;/var/log/apache2&quot;, &quot;/etc/apache2&quot;
注：
　　一个卷可以存在于一个或多个容器的指定目录，该目录可以绕过联合文件系统，并具有以下功能：
卷可以容器间共享和重用
容器并不一定要和其它容器共享卷
修改卷后会立即生效
对卷的修改不会对镜像产生影响
卷会一直存在，直到没有任何容器在使用它
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>WORKDIR：工作目录，类似于cd命令</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    WORKDIR /path/to/workdir
示例：
    WORKDIR /a  (这时工作目录为/a)
    WORKDIR b  (这时工作目录为/a/b)
    WORKDIR c  (这时工作目录为/a/b/c)
注：
　　通过WORKDIR设置工作目录后，Dockerfile中其后的命令RUN、CMD、ENTRYPOINT、ADD、COPY等命令都会在该目录下执行。在使用docker run运行容器时，可以通过-w参数覆盖构建时所设置的工作目录。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>USER:指定运行容器时的用户名或 UID，后续的 RUN 也会使用指定用户。使用USER指定用户时，可以使用用户名、UID或GID，或是两者的组合。当服务不需要管理员权限时，可以通过该命令指定运行用户。并且可以在之前创建所需要的用户</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式:
　　USER user
　　USER user:group
　　USER uid
　　USER uid:gid
　　USER user:gid
　　USER uid:group
 示例：
    　　USER www
 注：
　　使用USER指定用户后，Dockerfile中其后的命令RUN、CMD、ENTRYPOINT都将使用该用户。镜像构建完成后，通过docker run运行容器时，可以通过-u参数来覆盖所指定的用户。
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ARG：用于指定传递给构建运行时的变量</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
    ARG &lt;name&gt;[=&lt;default value&gt;]
示例：
    ARG site
    ARG build_user=www
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>ONBUILD：用于设置镜像触发器</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>格式：
　　ONBUILD [INSTRUCTION]
示例：
　　ONBUILD ADD . /app/src
　　ONBUILD RUN /usr/local/bin/python-build --dir /app/src
注：
　　当所构建的镜像被用做其它镜像的基础镜像，该镜像中的触发器将会被钥触发
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_13-3-docker镜像构建方式" tabindex="-1"><a class="header-anchor" href="#_13-3-docker镜像构建方式" aria-hidden="true">#</a> 13.3 Docker镜像构建方式</h2><p>构建Docker镜像主要分为四种方式：</p><p>第一种：使用原生的Dockefile文件构建</p><p>第二种：使用第三方的Docker Maven插件构建</p><p>第三种：使用本地模板导入</p><p>第四种：基于已有容器创建镜像</p><p>本章节主要介绍如何使用Docker Maven插件将SpringBoot应用打包为Docker镜像、上传，并且在Docker容器中运行</p><p><strong>1. 使用Maven插件构建镜像</strong></p><p>Maven是一个强大的项目管理与构建工具。如果可以使用Maven构建Docker镜像，以下几款Maven的Docker插件比较常用。 <img src="https://gaofee.cc/images/202303171137366.png" alt="1569409523039" loading="lazy"> 各项目的功能性、文档易用性、更新频率、社区活跃度、Stars等几个纬度考虑，选用了第一款。这是一款由Spotify公司开发的Maven插件，推荐使用Spotify公司开发的Maven插件。</p><p><strong>1) docker-maven-plugin 介绍：</strong></p><p>在我们持续集成过程中，项目工程一般使用 Maven 编译打包，然后生成镜像，通过镜像上线，能够大大提供上线效率，同时能够快速动态扩容，快速回滚，着实很方便。docker-maven-plugin 插件就是为了帮助我们在Maven工程中，通过简单的配置，自动生成镜像并推送到仓库中</p><p><strong>需要注意的是：</strong></p><ul><li><p>虽然可以使用Maven插件便捷地构建Spring Boot应用程序的Docker镜像，但是最核心的还是如何编写Dockerfile构建脚本，并不是说我们使用了Maven插件构建镜像就不需要写Dockerfile脚本了（可以写在Dockerfile文件中或者写在POM文件的标签里面）</p></li><li><p>使用Maven插件进行自动化构建镜像时，需要做以下的设置，映射出本机的2375接口，否则在使用maven命令打包的时候会报错，原因就是在使用Maven插件进行构建镜像的时候，他是通过rest风格的方式和远程Docker进行通讯的，而通讯的端口就是2375，包含构建镜像和上传镜像</p></li></ul><p><strong>2) 环境、软件准备</strong></p><p>本次演示环境是在本机 VMware上操作，以下是安装的软件及版本：</p><p>Docker：1.13.1, build 7f2769b/1.13.1 VMware® Workstation 14 Pro ：14.1.3 build-9474260 docker-maven-plugin：1.0.0 注意：这里我们要测试 Java Maven 项目用 docker-maven 插件打镜像，上传镜像等操作。</p><p><strong>2. 使用Dokerfile构建镜像</strong></p><p>使用Dockerfile直接构建镜像作为知识的扩展点</p><p>本次案例我们借助Docker Maven插件进行生成镜像</p><h2 id="_13-4-vmware虚拟机" tabindex="-1"><a class="header-anchor" href="#_13-4-vmware虚拟机" aria-hidden="true">#</a> 13.4 VMware虚拟机</h2><p><strong>1. 下载</strong></p>`,54),se={href:"https://www.vmware.com/cn.html%EF%BC%8C%E7%82%B9%E5%87%BB%E5%B7%A6%E4%BE%A7%E5%AF%BC%E8%88%AA%E6%A0%8F%E4%B8%AD%E7%9A%84%E4%BA%A7%E5%93%81%E4%B8%8B%E8%BD%BD%EF%BC%8C%E5%86%8D%E7%82%B9%E5%87%BB%E5%9B%BE%E4%B8%AD%E6%A0%87%E8%AE%B0%E7%9A%84Workstation",target:"_blank",rel:"noopener noreferrer"},le=a(`<img src="https://gaofee.cc/images/202303171137367.png" alt="1569484068465" style="zoom:67%;"><p>2.根据操作系统选择合适的产品，在这里以Windows系统为例，点击转至下载，如下图所示。</p><figure><img src="https://gaofee.cc/images/202303171137368.png" alt="1569484122449" tabindex="0" loading="lazy"><figcaption>1569484122449</figcaption></figure><p>3.选择版本，默认为最新版本。选择好版本后点击立即下载。</p><figure><img src="https://gaofee.cc/images/202303171137369.png" alt="1569484163910" tabindex="0" loading="lazy"><figcaption>1569484163910</figcaption></figure><p><strong>2. 安装</strong></p><ol><li>打开.exe文件， 即可开始安装</li></ol><img src="https://gaofee.cc/images/202303171137370.png" alt="1569484246380" style="zoom:80%;"><ol start="2"><li>安装位置默认在C盘下，在这里我选择安装在F盘，安装路径尽量不要有中文</li></ol><img src="https://gaofee.cc/images/202303171137371.png" alt="1569484275737" style="zoom:80%;"><ol start="3"><li>等待安装</li></ol><img src="https://gaofee.cc/images/202303171137372.png" alt="1569484308548" style="zoom:80%;"><ol start="4"><li>安装成功后，第一次运行程序会要求输入密钥，这个可以自己百度,也可以使用14天</li></ol><img src="https://gaofee.cc/images/202303171137373.png" alt="1569484408033" style="zoom:80%;"><h2 id="_13-5创建虚拟机" tabindex="-1"><a class="header-anchor" href="#_13-5创建虚拟机" aria-hidden="true">#</a> 13.5创建虚拟机</h2><p><strong>1.开始创建虚拟机</strong></p><ol><li>安装完vmware后，双击桌面图标，创建新的虚拟机，如下图：</li></ol><figure><img src="https://gaofee.cc/images/202303171137374.png" alt="1569484683321" tabindex="0" loading="lazy"><figcaption>1569484683321</figcaption></figure><ol start="2"><li>使用推荐安装</li></ol><img src="https://gaofee.cc/images/202303171137375.png" alt="1569484713460" style="zoom:67%;"><p>3）需要下载CentOS-7-x86_64-DVD-1804.iso文件，作为虚拟机内的操作系统</p><img src="https://gaofee.cc/images/202303171137376.png" alt="1569484748982" style="zoom:50%;"><p>4）一直点击【下一步】不用修改默认设置，看到这个界面点击完成即可创建虚拟机</p><img src="https://gaofee.cc/images/202303171137377.png" alt="1569484832719" style="zoom:67%;"><p><strong>2. 启动虚拟机</strong></p><p>点击箭头方向即可启动我们的VMware</p><figure><img src="https://gaofee.cc/images/202303171137378.png" alt="1569465787736" tabindex="0" loading="lazy"><figcaption>1569465787736</figcaption></figure><p>VMware启动成功，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137379.png" alt="1569465927925" tabindex="0" loading="lazy"><figcaption>1569465927925</figcaption></figure><p><strong>3、 虚拟机静态ip设置</strong></p><p>在使用虚拟机的时候ip经常会变，所以在有的时候我们需要将ip地址设置为静态的</p><p>1、编辑网卡配置文件，如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>vi  /etc/sysconfig/network-scripts/ifcfg-ens33
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://gaofee.cc/images/202303171137380.png" alt="1571278022803" tabindex="0" loading="lazy"><figcaption>1571278022803</figcaption></figure><p>将上面的Rootproto参数改为static（默认为phcp动态）,设置IPADDR、NETMASK，将ONBOOT设置为yes</p><p>2、然后重启网络</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>service network  restart
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>这样的话，就将ip设置为固定ip,执行下面的命令查看修改后的ip地址</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>ifconfig
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://gaofee.cc/images/202303171137381.png" alt="1571278312913" tabindex="0" loading="lazy"><figcaption>1571278312913</figcaption></figure><h2 id="_13-5-部署快速入门" tabindex="-1"><a class="header-anchor" href="#_13-5-部署快速入门" aria-hidden="true">#</a> 13.5 部署快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立两个个Module，父Module是itheima-chapter-12，里面没有任何代码，它用来管理我们的聚合工程。 <strong>eureka-server-docker、eureka-client-docker</strong>代码直接复制第二章节Eureka章节itheima-chapter-02的代码，在这个基础上修改了配置文件。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    	&lt;module&gt;eureka-client-docker&lt;/module&gt;
        &lt;module&gt;eureka-server-docker&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>具体场景：</strong></p><p>将eureka-server-docker、eureka-client-docker通过Docker Maven插件，打包镜像、然后上传镜像到Docker，因为没有Linux环境，目前是将Docker安装到了VMware中</p><p><strong>当前案例VMware密码为 root</strong></p><p>然后将eureka-server-docker、eureka-client-docker在Docker启动并访问，完成微服务部署到Docker容器。</p><p>章节代码：itheima-chapter-13，工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171137382.png" alt="1569461005350" tabindex="0" loading="lazy"><figcaption>1569461005350</figcaption></figure><h3 id="_13-5-1-搭建父模块" tabindex="-1"><a class="header-anchor" href="#_13-5-1-搭建父模块" aria-hidden="true">#</a> <strong>13.5.1 搭建父模块</strong></h3><p>父模块：itheima-chapter-13</p><p>当前模块为eureka-server-docker、eureka-client-docker的父模块，里面存储了一些公共信息，供下面的子模块使用，当前模块没有任何代码，只是一个pom依赖关系的管理，目的就是创建聚合工程</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>&lt;?xml version=&quot;1.0&quot; encoding=&quot;UTF-8&quot;?&gt;
&lt;project xmlns=&quot;http://maven.apache.org/POM/4.0.0&quot; xmlns:xsi=&quot;http://www.w3.org/2001/XMLSchema-instance&quot;
         xsi:schemaLocation=&quot;http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd&quot;&gt;
    &lt;modelVersion&gt;4.0.0&lt;/modelVersion&gt;
    &lt;parent&gt;
        &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
        &lt;artifactId&gt;spring-boot-starter-parent&lt;/artifactId&gt;
        &lt;version&gt;2.1.0.RELEASE&lt;/version&gt;
        &lt;relativePath/&gt; &lt;!-- lookup parent from repository --&gt;
    &lt;/parent&gt;
    &lt;groupId&gt;com.itheima&lt;/groupId&gt;
    &lt;artifactId&gt;itheima-chapter-13&lt;/artifactId&gt;
    &lt;version&gt;0.0.1-SNAPSHOT&lt;/version&gt;
    &lt;name&gt;itheima-chapter-13&lt;/name&gt;
    &lt;packaging&gt;pom&lt;/packaging&gt;
    &lt;description&gt;Demo project for Spring Boot&lt;/description&gt;
    &lt;modules&gt;
        &lt;module&gt;eureka-client-docker&lt;/module&gt;
        &lt;module&gt;eureka-server-docker&lt;/module&gt;
    &lt;/modules&gt;
    &lt;properties&gt;
        &lt;project.build.sourceEncoding&gt;UTF-8&lt;/project.build.sourceEncoding&gt;
        &lt;project.reporting.outputEncoding&gt;UTF-8&lt;/project.reporting.outputEncoding&gt;
        &lt;java.version&gt;1.8&lt;/java.version&gt;
        &lt;spring-cloud.version&gt;Greenwich.RELEASE&lt;/spring-cloud.version&gt;
    &lt;/properties&gt;
    &lt;dependencyManagement&gt;
        &lt;dependencies&gt;
            &lt;dependency&gt;
                &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
                &lt;artifactId&gt;spring-cloud-dependencies&lt;/artifactId&gt;
                &lt;version&gt;\${spring-cloud.version}&lt;/version&gt;
                &lt;type&gt;pom&lt;/type&gt;
                &lt;scope&gt;import&lt;/scope&gt;
            &lt;/dependency&gt;
        &lt;/dependencies&gt;
    &lt;/dependencyManagement&gt;
    &lt;build&gt;
        &lt;plugins&gt;
            &lt;plugin&gt;
                &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
                &lt;artifactId&gt;spring-boot-maven-plugin&lt;/artifactId&gt;
            &lt;/plugin&gt;

        &lt;/plugins&gt;
    &lt;/build&gt;
&lt;/project&gt;

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的主要内容就是管理了聚合工程，多module的管理</p><p>加入打包插件spring-boot-maven-plugin,当前依赖是帮助我们打包使用的</p><h3 id="_13-5-2-搭建服务端" tabindex="-1"><a class="header-anchor" href="#_13-5-2-搭建服务端" aria-hidden="true">#</a> 13.5.2 搭建服务端</h3><p><strong>1. 创建eureka-server-docker</strong></p><p>搭建Eureka服务端，将所有的起步依赖、插件、Dockerfile配置完成后，部署到Docker容器中</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>&lt;dependencies&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring‐cloud‐starter‐netflix‐eureka‐server&lt;/artifactId&gt;
        &lt;/dependency&gt;
    &lt;/dependencies&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>pom文件加入Eureka注册中心服务端的起步依赖</p><p><strong>3. 增加docker-maven-plugin</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      &lt;plugin&gt;
                &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
                &lt;artifactId&gt;spring-boot-maven-plugin&lt;/artifactId&gt;
            &lt;/plugin&gt;
            &lt;plugin&gt;
                &lt;!-- Spotify公司开发的Maven插件--&gt;
                &lt;groupId&gt;com.spotify&lt;/groupId&gt;
                &lt;artifactId&gt;docker-maven-plugin&lt;/artifactId&gt;
                &lt;version&gt;1.0.0&lt;/version&gt;
                &lt;!--执行例如mvn clean package时，插件就自动构建Docker镜像。 要想实现这点，只须将插件的goal绑定在某个phase即可 --&gt;
                &lt;executions&gt;
                    &lt;execution&gt;
                        &lt;!--就可将插件绑定在package这个phase上。也就是说，用户只须执行mvn clean package，就会自动执行mvn docker:build--&gt;
                        &lt;id&gt;build-image&lt;/id&gt;
                        &lt;phase&gt;package&lt;/phase&gt;
                        &lt;goals&gt;
                            &lt;goal&gt;build&lt;/goal&gt;
                        &lt;/goals&gt;
                    &lt;/execution&gt;
                &lt;/executions&gt;
                &lt;configuration&gt;
                    &lt;!--覆盖已存在的标签 镜像--&gt;
                    &lt;forceTags&gt;true&lt;/forceTags&gt;
                    &lt;!--镜像名称：命令规则为artifactId和版本，可以自定义镜像名称， 比如指定镜像名称 仓库/镜像名:标签：itheima/eureka:0.0.1--&gt;
                    &lt;imageName&gt;\${project.artifactId}:\${project.version}&lt;/imageName&gt;
                    &lt;!--使用 Dockerfile，查找Dockfile文件--&gt;
                    &lt;dockerDirectory&gt;src/main/resources&lt;/dockerDirectory&gt;
                    &lt;!-- 指定Docker仓库地址，需要暴露2375端口， 因为maven docker插件需要通过rest方式调用Docker API进行构建和上传镜像 --&gt;
                    &lt;dockerHost&gt;http://192.168.71.129:2375&lt;/dockerHost&gt;
                    &lt;resources&gt;
                        &lt;!-- 指定资源文件 --&gt;
                        &lt;resource&gt;
                            &lt;!-- 指定要复制的目录路径，这里是当前目录 --&gt;
                            &lt;targetPath&gt;/&lt;/targetPath&gt;
                            &lt;!-- 指定要复制的根目录，这里是target目录 --&gt;
                            &lt;directory&gt;\${project.build.directory}&lt;/directory&gt;
                            &lt;!-- 指定需要拷贝的文件，这里指最后生成的jar包 --&gt;
                            &lt;include&gt;\${project.build.finalName}.jar&lt;/include&gt;
                        &lt;/resource&gt;
                    &lt;/resources&gt;
                &lt;/configuration&gt;
            &lt;/plugin&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的plugin主要是加入了Docker maven插件的管理，引入docker-maven-plugin插件后， 我们的模块 eureka-server-docker就具备了Docker构建镜像、上传的能力了。</p><p><strong>4. 增加Dockerfile</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#指定基础镜像，必须为第一个命令这里使用openjdk的基础镜像
FROM openjdk:8-jdk-alpine
#MAINTAINER: 维护者信息，这里是维护者是itheima
MAINTAINER  itheima
#VOLUME：用于指定持久化目录,挂载镜像
VOLUME /itheima
#将本地文件添加到容器中，这里是从target下复制eureka-server-docker-0.0.1-SNAPSHOT.jar到根目录
ADD eureka-server-docker-0.0.1-SNAPSHOT.jar  /
#RUN：构建镜像时执行的命令，这里是设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo &#39;Asia/Shanghai&#39; &gt;/etc/timezone
#ENV：设置环境变量
ENV JAVA_OPTS=&quot;&quot;
#ENTRYPOINT：配置容器，使其可执行化。配合CMD可省去&quot;application&quot;，只使用参数，这里还可以通过&quot;--#spring.config.location=/config/bootstrap-test.yml&quot;参数设置启动哪个环境的配置文件
ENTRYPOINT [&quot;java&quot;,&quot;-Djava.security.egd=file:/dev/./urandom&quot;,&quot;-jar&quot;,&quot;/eureka-server-docker-0.0.1-SNAPSHOT.jar&quot;]

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面定义的是Dockerfile文件（上面提到：此处也可以不写Dockerfile，直接将Dockerfile文件内容写到我们的POM文件中也可以）， 这样的话，我们的服务就完全具备了构建镜像和发布镜像的能力了，此处我们还是讲所有的打包镜像的脚本写到Dockfile文件中</p><p>Dockerfile文件根据模块pom中定义，我们需要把文件放到resources下面，如下图</p><figure><img src="https://gaofee.cc/images/202303171137383.png" alt="1569487516796" tabindex="0" loading="lazy"><figcaption>1569487516796</figcaption></figure><p><strong>5. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: eureka-server-docker

server:
  port: 8761

eureka:
  server:
    enable-self-preservation: false #关闭自我保护机制
    eviction-interval-timer-in-ms: 60000 #清理间隔(单位:毫秒,默认是60*1000)
  instance:
    prefer-ip-address: true
    hostname: localhost
  # 禁止向自己注册 必须将eureka.client.register-with-eureka和eureka.client.fetch-registry 设置为false
  client:
    register-with-eureka: false #是否将自己注册到Eureka服务中，本身就是所有无需注册
    fetch-registry: false #是否从Eureka中获取注册信息
    service-url: #Eureka客户端与Eureka服务端进行交互的地址
      defaultZone: http://\${eureka.instance.hostname}:\${server.port}/eureka/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 启动入口</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaServerApplication.class, args);
	}

}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上是Eureka 服务端的启动类，加入注解@EnableEurekaServer，标记这个类是一个Eureka服务端</p><h3 id="_13-5-3-暴露端口" tabindex="-1"><a class="header-anchor" href="#_13-5-3-暴露端口" aria-hidden="true">#</a> 13.5.3 暴露端口</h3>`,76),de={href:"http://192.168.71.129:2375",target:"_blank",rel:"noopener noreferrer"},ce=a(`<p>这个标签，他的意思是Docker Maven插件在构建镜像的时候，需要通过rest和Docker通讯，而通讯的接口就是2375，所以，我们在构建镜像前，需要将Docker的2375端口暴露出来</p><ol><li>进行VMware Docker，执行</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>vim /usr/lib/systemd/system/docker.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>如下图：</p><img src="https://gaofee.cc/images/202303171137384.png" alt="1569498007246" style="zoom:67%;"><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>ExecStart=/usr/bin/dockerd  -H tcp://0.0.0.0:2375 -H unix://var/run/docker.sock \\
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>进入到VIM之后、点击键盘i（进入编辑模式），将红框的地方加入到对应的地方</p><p>然后键盘ESC退出、:wq！保存即可</p><p>接着重新加载docker配置，执行下面的命令</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>systemctl daemon-reload // 1，加载docker守护线程
systemctl restart docker // 2，重启docker
systemctl stop firewalld.service //3一定关闭防火墙
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>这样的话，我们的2375就成功对外暴露了</p><p><strong>8. 打开telnet</strong></p><p>下面将使用telnet测试下我们的2375端口是否成功打开，首先，打开操作系统（这里是win7）的telnet功能</p><p>第一步：打开系统的控制面板：</p><img src="https://gaofee.cc/images/202303171137385.png" alt="1569546592281" style="zoom:67%;"><p>第二步：打开程序和功能</p><figure><img src="https://gaofee.cc/images/202303171137386.png" alt="1569546631566" tabindex="0" loading="lazy"><figcaption>1569546631566</figcaption></figure><p>第三步：打开或关闭windows功能</p><figure><img src="https://gaofee.cc/images/202303171137387.png" alt="1569546725903" tabindex="0" loading="lazy"><figcaption>1569546725903</figcaption></figure><p>第四步：将telnet客户端、telnet服务端勾选，点击确定按钮</p><img src="https://gaofee.cc/images/202303171137388.png" alt="1569546766199" style="zoom:67%;"><p>第五步：打开cmd窗口，测试telnet功能是否打开，成功打开如下图</p><img src="https://gaofee.cc/images/202303171137389.png" alt="1569546916276" style="zoom:67%;"><figure><img src="https://gaofee.cc/images/202303171137390.png" alt="1569546971577" tabindex="0" loading="lazy"><figcaption>1569546971577</figcaption></figure><p>点击回车，如下图，出现这个界面说明telnet成功启用</p><img src="https://gaofee.cc/images/202303171137391.png" alt="1569546845842" style="zoom:67%;"><p><strong>9. 暴露端口测试</strong></p><p>测试我们的2375端口是否成功打开</p><p>cmd窗口输入</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>telnet  192.168.71.129  2375
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>点击回车</strong>，出现下面的画面，说明2375端口<strong>暴露成功</strong></p><figure><img src="https://gaofee.cc/images/202303171137392.png" alt="1569547826579" tabindex="0" loading="lazy"><figcaption>1569547826579</figcaption></figure><p>出现下面的画面，说明2375端口<strong>暴露失败</strong></p><figure><img src="https://gaofee.cc/images/202303171137393.png" alt="1569547237513" tabindex="0" loading="lazy"><figcaption>1569547237513</figcaption></figure><h3 id="_13-5-4-构建镜像" tabindex="-1"><a class="header-anchor" href="#_13-5-4-构建镜像" aria-hidden="true">#</a> 13.5.4 构建镜像</h3><p><strong>1.开始构建镜像</strong></p><p><strong>这个环节是最重要最核心的步骤</strong>，我们之前把Docker maven插件、Dockerfile文件都编写好了，这个时候需要打包、自动构建镜像、自动上传镜像</p><p>然后，执行打包操作，如下图，点击右三角后，就开始执行打包操作</p><figure><img src="https://gaofee.cc/images/202303171137394.png" alt="1569485436064" tabindex="0" loading="lazy"><figcaption>1569485436064</figcaption></figure><p>开始构建镜像，如下图</p><figure><img src="https://gaofee.cc/images/202303171137395.png" alt="1569485555679" tabindex="0" loading="lazy"><figcaption>1569485555679</figcaption></figure><p>第一次构建镜像、上传镜像会下载大量的依赖，时间会稍微长一点</p><p>镜像构建成功后，查看控制台输出，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137396.png" alt="1569492201876" tabindex="0" loading="lazy"><figcaption>1569492201876</figcaption></figure><p>我们的镜像已经成功构建并上传到了Docker</p><p><strong>2. Docker查看镜像</strong></p><p>在上面我们的镜像已经成功构建并上传到了Docker，我们去VMware的Docker查看下，如下图</p><figure><img src="https://gaofee.cc/images/202303171137397.png" alt="1569492294161" tabindex="0" loading="lazy"><figcaption>1569492294161</figcaption></figure><p>可以到看我们的eureka-server-docker镜像已经成功生成。</p><p><strong>3. 下载基础镜像</strong></p><p>在启动我们刚才生成的eureka-server-docker镜像前，我们需要下载JDK基础镜像，为我们的微服务提供一个JDK运行环境</p><p>打开Docker界面，输入下面的命令，如下：</p><figure><img src="https://gaofee.cc/images/202303171137398.png" alt="1569488369108" tabindex="0" loading="lazy"><figcaption>1569488369108</figcaption></figure><p>从远程镜像仓库拉取openjdk:8-jdk-alpine基础镜像</p><p>点击回车，如下：</p><figure><img src="https://gaofee.cc/images/202303171137399.png" alt="1569488426284" tabindex="0" loading="lazy"><figcaption>1569488426284</figcaption></figure>`,56),oe={href:"http://docker.io/openjdk:8-jdk-alpine%EF%BC%8C",target:"_blank",rel:"noopener noreferrer"},ue=e("strong",null,"表示镜像下载成功",-1),ge={href:"http://docker.io/openjdk:8-jdk-alpine%E9%95%9C%E5%83%8F%EF%BC%8C%E5%A6%82%E4%B8%8B%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},pe=a(`<figure><img src="https://gaofee.cc/images/202303171137400.png" alt="1569488486595" tabindex="0" loading="lazy"><figcaption>1569488486595</figcaption></figure><p><strong>这个下载基础镜像的操作只操作一次</strong></p><p>以后我们如果在把其他的微服务部署到Docker中的时候就使用就这个基础镜像就可以了,以后就不用下载基础镜像了.</p><p><strong>常常出现的问题：如果在执行命令docker images（或者其他命令）报错，如下：</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>请重启docker即可解决，重启命令如下：</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>systemctl restart docker
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p><strong>4. Docker启动镜像</strong></p><ol><li>这里是启动我们的Eureka-server-docker的镜像，启动如下：</li></ol><figure><img src="https://gaofee.cc/images/202303171137401.png" alt="1569496643243" tabindex="0" loading="lazy"><figcaption>1569496643243</figcaption></figure><p>由上图可见，我们的微服务在Docker中已成功运行了</p><p>启动命令：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker  run -dti  --name eureka-0001  -p 8761:8761 eureka-server-docker:0.0.1-SNAPSHOT
#run:表示启动一个镜像
#dti：后台运行
#name:表示容器启动的name名称
#p:表示端口映射，前面的端口为主机端口、后面的端口为容器的端口
#eureka-server-docker:0.0.1-SNAPSHOT，表示镜像的名字=REPOSITORY:TAG
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ol start="2"><li>查看容器（镜像启动起来就叫容器）命令：</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker ps
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>容器列表，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137402.png" alt="1569496758388" tabindex="0" loading="lazy"><figcaption>1569496758388</figcaption></figure><ol start="3"><li><strong>启动镜像出现的问题：</strong></li></ol><p><strong>在启动容器如果报错（如下命令），请执行shell命令重启docker</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#执行docker  run -dti  --name eu  -p 8761:8761 eureka-server-docker:0.0.1-SNAPSHOT报错
=====================================================================================
63ed36306cad335ac387ebd755a15f09cac3c7df59721343a8c3d85badfffb78
/usr/bin/docker-current: Error response from daemon: driver failed programming external connectivity on endpoint eureka-3330001 (788de2d05ec89f5ca579ac00fe19738926af5eed9e330c25a86c78ff70241c85):  (iptables failed: iptables --wait -t nat -A DOCKER -p tcp -d 0/0 --dport 8761 -j DNAT --to-destination 172.17.0.2:8761 ! -i docker0: iptables: No chain/target/match by that name.

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>请执行重启Docker命令即可解决以上问题</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>systemctl restart docker

或者

sudo systemctl daemon-reload  
systemctl restart  docker 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h3 id="_13-5-5-访问docker服务" tabindex="-1"><a class="header-anchor" href="#_13-5-5-访问docker服务" aria-hidden="true">#</a> 13.5.5 访问Docker服务</h3><p>这里说下本案例的IP情况</p><table><thead><tr><th>宿主机</th><th>虚拟机</th><th>Docker</th></tr></thead><tbody><tr><td>172.16.43.175</td><td>192.168.71.129</td><td>172.17.0.1</td></tr></tbody></table><p>这个时候我们要访问Docker上服务的时候就需要访问192.168.71.129：8761</p><p>原因如下：我们在启动Docker镜像的时候，使用的命令是</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker  run -dti  --name eureka-0001  -p 8761:8761 eureka-server-docker:0.0.1-SNAPSHOT
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>上面命令的意思：</p><p>-p 8761:8761</p><p>第一个8761是虚拟机(192.168.71.129)的</p><p>第二个8761是容器的(172.17.0.1)的</p><p>他们之间做了了IP映射，由于我本机（172.16.43.175）与虚拟机采用的是桥接模式，他们之间互通</p>`,33),ve={href:"http://192.168.71.129:8761/%E6%98%AF%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E6%88%91%E4%BB%ACDocker%E6%9C%8D%E5%8A%A1%E7%9A%84%EF%BC%9B%E8%BF%90%E8%A1%8C%E6%95%88%E6%9E%9C%E5%A6%82%E4%B8%8B%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},me=a(`<figure><img src="https://gaofee.cc/images/202303171137403.png" alt="1569496814747" tabindex="0" loading="lazy"><figcaption>1569496814747</figcaption></figure><h3 id="_13-5-6-搭建客户端" tabindex="-1"><a class="header-anchor" href="#_13-5-6-搭建客户端" aria-hidden="true">#</a> 13.5.6 搭建客户端</h3><p><strong>1. 创建eureka-client-docker</strong></p><p>搭建Eureka客户端，将所有的起步依赖、插件、Dockerfile配置完成后，部署到Docker容器中</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring-cloud-starter-netflix-eureka-client&lt;/artifactId&gt;
        &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>pom文件加入Eureka注册中心客户端的起步依赖</p><p><strong>3. 增加docker-maven-plugin</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>    &lt;plugin&gt;
                &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
                &lt;artifactId&gt;spring-boot-maven-plugin&lt;/artifactId&gt;
            &lt;/plugin&gt;
            &lt;plugin&gt;
                &lt;!-- Spotify公司开发的Maven插件--&gt;
                &lt;groupId&gt;com.spotify&lt;/groupId&gt;
                &lt;artifactId&gt;docker-maven-plugin&lt;/artifactId&gt;
                &lt;version&gt;1.0.0&lt;/version&gt;
                &lt;!--执行例如mvn clean package时，插件就自动构建Docker镜像。 要想实现这点，只须将插件的goal绑定在某个phase即可 --&gt;
                &lt;executions&gt;
                    &lt;execution&gt;
                        &lt;!--就可将插件绑定在package这个phase上。也就是说，用户只须执行mvn clean package，就会自动执行mvn docker:build--&gt;
                        &lt;id&gt;build-image&lt;/id&gt;
                        &lt;phase&gt;package&lt;/phase&gt;
                        &lt;goals&gt;
                            &lt;goal&gt;build&lt;/goal&gt;
                        &lt;/goals&gt;
                    &lt;/execution&gt;
                &lt;/executions&gt;
                &lt;configuration&gt;
                    &lt;!--覆盖已存在的标签 镜像--&gt;
                    &lt;forceTags&gt;true&lt;/forceTags&gt;
                    &lt;!--镜像名称：命令规则为artifactId和版本，可以自定义镜像名称， 比如指定镜像名称 仓库/镜像名:标签：itheima/eureka:0.0.1--&gt;
                    &lt;imageName&gt;\${project.artifactId}:\${project.version}&lt;/imageName&gt;
                    &lt;!--使用 Dockerfile，查找Dockfile文件--&gt;
                    &lt;dockerDirectory&gt;src/main/resources&lt;/dockerDirectory&gt;
                    &lt;!-- 指定Docker仓库地址，需要暴露2375端口， 因为maven docker插件需要通过rest方式调用Docker API进行构建和上传镜像 --&gt;
                    &lt;dockerHost&gt;http://192.168.71.129:2375&lt;/dockerHost&gt;
                    &lt;resources&gt;
                        &lt;!-- 指定资源文件 --&gt;
                        &lt;resource&gt;
                            &lt;!-- 指定要复制的目录路径，这里是当前目录 --&gt;
                            &lt;targetPath&gt;/&lt;/targetPath&gt;
                            &lt;!-- 指定要复制的根目录，这里是target目录 --&gt;
                            &lt;directory&gt;\${project.build.directory}&lt;/directory&gt;
                            &lt;!-- 指定需要拷贝的文件，这里指最后生成的jar包 --&gt;
                            &lt;include&gt;\${project.build.finalName}.jar&lt;/include&gt;
                        &lt;/resource&gt;
                    &lt;/resources&gt;
                &lt;/configuration&gt;
            &lt;/plugin&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面的plugin主要是加入了Docker maven插件的管理，引入docker-maven-plugin插件后， 我们的模块 eureka-client-docker就具备了Docker构建镜像、上传的能力了。</p><p><strong>4. 增加Dockerfile</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>#指定基础镜像，必须为第一个命令这里使用openjdk的基础镜像
FROM openjdk:8-jdk-alpine
#MAINTAINER: 维护者信息，这里是维护者是itheima
MAINTAINER  itheima
#VOLUME：用于指定持久化目录,挂载镜像
VOLUME /itheima
#将本地文件添加到容器中，这里是从target下复制eureka-client-docker-0.0.1-SNAPSHOT.jar到根目录
ADD eureka-client-docker-0.0.1-SNAPSHOT.jar  app.jar
#RUN：构建镜像时执行的命令，这里是设置时区
RUN ln -sf /usr/share/zoneinfo/Asia/Shanghai /etc/localtime
RUN echo &#39;Asia/Shanghai&#39; &gt;/etc/timezone
EXPOSE 8761
#ENV：设置环境变量
ENV JAVA_OPTS=&quot;&quot;
#ENTRYPOINT [&quot;java&quot;,&quot;-Djava.security.egd=file:/dev/./urandom&quot;,&quot;-Dspring.profiles.default&quot;,&quot;-jar&quot;,&quot;/app.jar&quot;]
ENTRYPOINT [&quot;java&quot;,&quot;-Djava.security.egd=file:/dev/./urandom&quot;,&quot;-jar&quot;,&quot;/app.jar&quot;]

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>上面定义的是Dockerfile文件（上面提到：此处也可以不写Dockerfile，直接将Dockerfile文件内容写到我们的POM文件中也可以）， 这样的话，我们的服务就完全具备了构建镜像和发布镜像的能力了，此处我们还是讲所有的打包镜像的脚本写到Dockfile文件中</p><p>Dockerfile文件根据模块pom中定义，我们需要把文件放到resources下面，如下图</p><figure><img src="https://gaofee.cc/images/202303171137404.png" alt="1569545783316" tabindex="0" loading="lazy"><figcaption>1569545783316</figcaption></figure><p><strong>5. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    inetutils:
      # 忽略指定网卡，支持正则表达式（这里使用正则表达式忽略所有虚拟机网卡）
      ignoredInterfaces: [&#39;VMware.*&#39;]
  application:
    name: eureka-client
server:
  port: 8762

eureka:
  client:
    service-url:
      defaultZone: http://192.168.71.129:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: localhost:\${server.port}
management:
  endpoints:
    web:
      exposure:
        include: &quot;*&quot;
  endpoint:
    health:
      show-details: ALWAYS
    shutdown:
      enabled: true # 必须将此属性设置为true 才能执行 curl -X POST http://localhost:9001/actuator/shutdown 命令
  server:
    port: 9001 # 指定Actuator对外暴露的REST API接口端口为9001


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,17),be={href:"http://192.168.71.129:8761/eureka/",target:"_blank",rel:"noopener noreferrer"},he=a(`<p>里面的ip一定要写主机的iP,不要写宿主主机或者localhost，如果写宿主主机，容器和宿主主机是无法通讯的，所以要写主机ip</p><p>在配置ip的时候一定要去VMware中输入命令去看下IP,因为有的时候在不同机器上地址会有变化（非静态IP）</p><figure><img src="https://gaofee.cc/images/202303171137405.png" alt="1569653276067" tabindex="0" loading="lazy"><figcaption>1569653276067</figcaption></figure><p><strong>由上图可见，在其他机器上ip变成了 inet 192.168.106.128</strong></p><p>在搭建客户端的时候，要重新修改下application.yml文件的defaultZone的地址</p><p>然后重新构建镜像、上传镜像</p><p><strong>6. 启动</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableEurekaClient
public class EurekaClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaClientApplication.class, args);
    }

}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>以上是Eureka 客户端的启动类，加入注解@EnableEurekaClient，标记这个类是一个Eureka客户端</p><p><strong>7. 暴露端口</strong></p><p>构建镜像前需要暴露2375端口，在构建服务注册中心已提及到，此处不再赘述（端口暴露，执行一次即可）</p><p><strong>如果还出现2375端口链接不上，说明我们的防火墙没有关闭</strong></p><p>执行下面的命令，关闭防火墙**（重要：如果不关闭，我们整个流程将无法继续进行）**：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>systemctl stop firewalld.service
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><h3 id="_13-5-7-构建镜像" tabindex="-1"><a class="header-anchor" href="#_13-5-7-构建镜像" aria-hidden="true">#</a> 13.5.7 构建镜像</h3><p><strong>1. 开始构建镜像</strong></p><p><strong>这个环节是最重要最核心的步骤</strong>，我们之前把Docker maven插件、Dockerfile文件都编写好了，这个时候需要打包、自动构建镜像、自动上传镜像</p><p>然后，执行打包操作，如下图，点击右三角后，就开始执行打包操作</p><figure><img src="https://gaofee.cc/images/202303171137406.png" alt="1569546196297" tabindex="0" loading="lazy"><figcaption>1569546196297</figcaption></figure><p>开始构建镜像，如下图</p><figure><img src="https://gaofee.cc/images/202303171137407.png" alt="1569548042806" tabindex="0" loading="lazy"><figcaption>1569548042806</figcaption></figure><p>第一次构建镜像、上传镜像会下载大量的依赖，时间会稍微长一点</p><p>镜像构建成功后，查看控制台输出，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137408.png" alt="1569548080798" tabindex="0" loading="lazy"><figcaption>1569548080798</figcaption></figure><p>我们的镜像已经成功构建并上传到了Docker</p><p><strong>2. Docker查看镜像</strong></p><p>在上面我们的镜像已经成功构建并上传到了Docker，我们去VMware的Docker查看下，如下图</p><figure><img src="https://gaofee.cc/images/202303171137409.png" alt="1569548298256" tabindex="0" loading="lazy"><figcaption>1569548298256</figcaption></figure><p>可以到看我们的eureka-client-docker镜像已经成功生成。</p><p><strong>3. 下载基础镜像</strong></p><p>在构建eureka-server-docker的时候，我们已经下载过基础镜像，此处不用再次下载</p><p><strong>4. Docker启动镜像</strong></p><p>这里是启动我们的Eureka-client-docker的镜像，启动如下：</p><figure><img src="https://gaofee.cc/images/202303171137410.png" alt="1569549297107" tabindex="0" loading="lazy"><figcaption>1569549297107</figcaption></figure><p>由上图可见，我们的微服务在Docker中已成功运行了</p><p>启动命令：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker  run -dti  --name eureka-0001  -p 8761:8761 eureka-server-docker:0.0.1-SNAPSHOT
#run:表示启动一个镜像
#dti：后台运行
#name:表示容器启动的name名称
#p:表示端口映射，前面的端口为主机端口、后面的端口为容器的端口
#eureka-server-docker:0.0.1-SNAPSHOT，表示镜像的名字=REPOSITORY:TAG
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>查看容器（镜像启动起来就叫容器）命令：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker ps
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>容器列表，如下图：</p><figure><img src="https://gaofee.cc/images/202303171137411.png" alt="1569549324334" tabindex="0" loading="lazy"><figcaption>1569549324334</figcaption></figure><p>由上图可以看出我们的eureka-client-docker、eureka-server-docker容器已成功运行</p><h3 id="_13-5-8-访问docker服务" tabindex="-1"><a class="header-anchor" href="#_13-5-8-访问docker服务" aria-hidden="true">#</a> 13.5.8 访问Docker服务</h3><p>这里说下本案例的IP情况</p><table><thead><tr><th>宿主机</th><th>虚拟机</th><th>Docker</th></tr></thead><tbody><tr><td>172.16.43.175</td><td>192.168.71.129</td><td>172.17.0.1</td></tr></tbody></table><p>这个时候我们要访问Docker上服务的时候就需要访问192.168.71.129：8761</p><p>原因如下：我们在启动Docker镜像的时候，使用的命令是</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>docker  run -dti  --name eureka-client  -p 8762:8762 eureka-client-docker:0.0.1-SNAPSHOT
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>上面命令的意思：</p><p>-p 8762:8762</p><p>第一个8762是虚拟机(192.168.71.129)的</p><p>第二个8762是容器的(172.17.0.1)的</p><p>他们之间做了了IP映射，由于我本机（172.16.43.175）与虚拟机采用的是桥接模式，他们之间互通</p>`,53),fe={href:"http://192.168.71.129:8761/%E6%98%AF%E5%8F%AF%E4%BB%A5%E8%AE%BF%E9%97%AE%E6%88%91%E4%BB%ACDocker%E6%9C%8D%E5%8A%A1%E7%9A%84%EF%BC%9B%E8%BF%90%E8%A1%8C%E6%95%88%E6%9E%9C%E5%A6%82%E4%B8%8B%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},ke=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171137412.png",alt:"1569551182863",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569551182863")],-1),xe=e("p",null,"由上图可知，我们的服务注册中心客户端在Docker容器环境中成功注册到了eureka-server-docker",-1),Ee=e("h2",{id:"_13-6-总结",tabindex:"-1"},[e("a",{class:"header-anchor",href:"#_13-6-总结","aria-hidden":"true"},"#"),i(" 13.6 总结")],-1),_e=e("p",null,"当前章节主要介绍了微服务如何在docker中运行",-1),De=e("p",null,"我们拿着之前的代码一个Eureka服务端、一个Eureka客户端代码稍微改造了下；最终的目标将这个服务部署到Docker中，并且可以正常运行和访问",-1),Se=e("p",null,[i("我们在部署Docker的时候，由于没有Linux环境，我们采用了VMware虚拟机作为Liunx平台装了Docker，将我们的"),e("strong",null,"eureka-server-docker、eureka-client-docker"),i("部署到了Docker容器中，并且能正常访问")],-1);function ye(qe,Ie){const t=r("ExternalLinkIcon"),s=r("dockerHost");return d(),c("div",null,[g,e("ol",null,[e("li",null,[i("浏览器输入码云远程git仓库地址"),e("a",p,[i("https://gitee.com/code80341157/itheima-repository/tree/master/itheima，如下图"),n(t)])])]),v,m,b,h,f,e("ol",null,[e("li",null,[i("浏览器输入"),e("a",k,[i("http://localhost:8762/itheima"),n(t)]),i(" 和"),e("a",x,[i("http://localhost:8262/itheima，如下图"),n(t)])])]),E,_,e("ol",D,[e("li",null,[i("通过postman工具(或者curl)发送post请求到： "),e("a",S,[i("http://localhost:8762/actuator/bus-refresh"),n(t)])])]),y,q,e("p",null,[i("3 然后访问"),e("a",I,[i("http://localhost:8262/itheima"),n(t)]),i(" 和 "),e("a",C,[i("http://localhost:8762/itheima，如下图"),n(t)])]),M,B,e("p",null,[i("此时发现，我们只是在cmd curl 中执行了curl -X POST "),e("a",A,[i("http://localhost:8762/actuator/bus-refresh"),n(t)])]),R,N,z,O,e("p",null,[w,i(),e("a",T,[i("http://localhost:8769/actuator/bus-refresh，**我们post请求到Config"),n(t)]),i(" Server，而不是Config Client**")]),P,e("p",null,[i("链路跟踪(sleuth)其实是一个工具,它在整个分布式系统中能跟踪一个用户请求的过程(包括数据采集，数据传输，数据存储，数据分析，"),e("a",j,[i("数据可视化"),n(t)]),i(")，捕获这些跟踪数据，就能构建微服务的整个调用链的视图，这是调试和监控微服务的关键工具。 SpringCloudSleuth有4个特点")]),U,e("p",null,[i("zipkin server是一个可执行jar包，浏览器输入"),e("a",V,[i("http://localhost:9411/zipkin/"),n(t)])]),F,Q,L,Z,e("p",null,[i("浏览器输入"),e("a",H,[i("http://localhost:8765/hi访问**EUREKA-FEIGN-SLEUTH**服务，如下图"),n(t)])]),G,e("ol",Y,[e("li",null,[i("访问生产者"),K,i("端点生产消息（将消息发送到RabbitMQ），浏览器输入"),e("a",W,[i("http://localhost:8080/greet/itheima"),n(t)]),i(" 生产者向RabbitMQ交换器、队列发送消息 【itheima】")])]),X,e("p",null,[i("接着访问生产者"),$,i("端点生产消息，浏览器输入"),e("a",J,[i("http://localhost:8080/greet/itheima"),n(t)]),i(" 生产者向RabbitMQ交换器、队列发送消息 【itheima】")]),ee,e("p",null,[i("Docker 是一个"),e("a",ie,[i("开源"),n(t)]),i("的应用容器引擎，让开发者可以打包他们的应用以及依赖包到一个可移植的镜像中，然后发布到任何流行的 "),e("a",ne,[i("Linux"),n(t)]),i("或Windows 机器上，也可以实现"),e("a",te,[i("虚拟化"),n(t)]),i("。容器是完全使用"),e("a",ae,[i("沙箱"),n(t)]),i("机制，相互之间不会有任何接口。")]),re,e("p",null,[i("1.进入VMware "),e("a",se,[i("https://www.vmware.com/cn.html，点击左侧导航栏中的产品下载，再点击图中标记的Workstation"),n(t)]),i(" Pro，如下图所示（本地案例使用的是14版本，版本10以上就可以）")]),le,e("p",null,[i("在上面的第三小节里面，我们配置了 "),n(s,null,{default:o(()=>[e("a",de,[i("http://192.168.71.129:2375"),n(t)])]),_:1})]),ce,e("p",null,[i("上面输出Downloaded newer image for "),e("a",oe,[i("docker.io/openjdk:8-jdk-alpine，"),n(t)]),ue]),e("p",null,[i("查看我们刚刚下载的Downloaded newer image for "),e("a",ge,[i("docker.io/openjdk:8-jdk-alpine镜像，如下："),n(t)])]),pe,e("p",null,[i("所以在浏览器地址栏输入"),e("a",ve,[i("http://192.168.71.129:8761/是可以访问我们Docker服务的；运行效果如下："),n(t)])]),me,e("p",null,[e("strong",null,[i("请注意上面的 defaultZone: "),e("a",be,[i("http://192.168.71.129:8761/eureka/"),n(t)])])]),he,e("p",null,[i("所以在浏览器地址栏输入"),e("a",fe,[i("http://192.168.71.129:8761/是可以访问我们Docker服务的；运行效果如下："),n(t)])]),ke,xe,Ee,_e,De,Se])}const Me=l(u,[["render",ye],["__file","day03-SpringCloud第三阶段.html.vue"]]);export{Me as default};
