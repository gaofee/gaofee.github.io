import{ab as r,G as a,H as s,E as e,S as i,N as l,ac as t,W as d}from"./framework-251de721.js";const c={},v=t(`<h1 id="学习目标" tabindex="-1"><a class="header-anchor" href="#学习目标" aria-hidden="true">#</a> 学习目标</h1><ul><li>能够知道什么是Feign 、工作原理，解决了什么问题</li><li>能够使用Feign完成声明式服务调用</li><li>能够知道什么是Hystrix、工作原理，解决了什么问题</li><li>能够使用Hystrix实现熔断服务</li><li>能够知道什么是Gateway、工作原理，解决了什么问题</li><li>能够使用Gateway实现服务路由</li><li>能够知道什么是Config、工作原理，解决了哪些问题</li><li>能够使用Config实现分布式配置</li></ul><h1 id="_6-feign声明式服务调用" tabindex="-1"><a class="header-anchor" href="#_6-feign声明式服务调用" aria-hidden="true">#</a> 6 Feign声明式服务调用</h1><h2 id="_6-1-feign概述" tabindex="-1"><a class="header-anchor" href="#_6-1-feign概述" aria-hidden="true">#</a> 6.1 Feign概述</h2><p><strong>1. Feign简介</strong></p><p>Feign是一个声明式的伪RPC的REST客户端，它用了基于接口的注解方式，很方便实现客户端配置。受Retrofit、JAXRS-2.0 和Web Socket 的影响， 采用了声明式API 接口的风格， 将Java Http 客户端绑定到它的内部，Feign 的首要目标是将Java Http客户端调用过程变得简单</p><p><strong>2. Feign工作原理</strong></p><ul><li>首先通过@EnableFeignCleints注解开启FeignCleint</li><li>根据Feign的规则实现接口，并加@FeignCleint注解</li><li>程序启动后，会进行包扫描，扫描所有的@ FeignCleint的注解的类，并将这些信息注入到ioc容器中。</li><li>当接口的方法被调用，通过jdk的代理，来生成具体的RequesTemplate</li><li>RequesTemplate在生成Request</li><li>Request交给Client去处理，其中Client可以是HttpUrlConnection、HttpClient也可以是Okhttp</li><li>最后Client被封装到LoadBalanceClient类，这个类结合类Ribbon做到了负载均衡。</li></ul><img src="https://gaofee.cc/images/202303171136856.png" alt="feign" style="zoom:67%;"><p>如上图：一个feign请求开始，通过动态代理的方式包裹了一层feign retryer逻辑，控制最外层的feign自身的重试机制，在进行服务调用的时候使用LoadBalanceClient类做了负载均衡</p><p><strong>3. Feign解决了哪些问题</strong></p><p>Feign 是一个伪Java Http 客户端， Feign 不做任何的请求处理。Feign 通过处理注解生成Request 模板，从而简化了Http API 的开发。开发人员可以使用注解的方式定制Request API模板。在发送HttpRequest 请求之前， Feign 通过处理注解的方式替换掉Request 模板中的参数，生成真正的Request ，并交给Java Http 客户端去处理。利用这种方式，开发者只需要关注Feign注解模板的开发，而不用关注Http 请求本身， 简化了Http 请求的过程，使得Http请求变得简单和容易理解</p><h2 id="_6-2-feign深入理解" tabindex="-1"><a class="header-anchor" href="#_6-2-feign深入理解" aria-hidden="true">#</a> 6.2 Feign深入理解</h2><p><strong>1. Feign常用参数</strong></p><ul><li>value&amp;name：指定FeignClient的名称，如果项目使用了Ribbon，name属性会作为微服务的名称，用于服务发现同（最常用）</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@FeignClient(name = &quot;microservice-provider-user&quot;)
等价于
@FeignClient(value = &quot;microservice-provider-user&quot;)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>fallback：调用失败时走的一些回退方法，可以用来抛出异常或给出默认返回数据，定义容错的处理类，当调用远程接口失败或超时时，会调用对应接口的容错逻辑，fallback指定的类必须实现@FeignClient标记的接口</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@FeignClient(name = &quot;github-client&quot;,fallback = GitHubClient.DefaultFallback.class)
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><ul><li><p>path：定义当前FeignClient的统一前缀</p></li><li><p>url：url一般用于调试，可以手动指定@FeignClient调用的地址；全路径地址或hostname，http或https</p></li><li><p>configuration：Feign配置类，可以自定义Feign的Encoder、Decoder、LogLevel、Contract定义当前feign client的一些配置</p></li></ul><p><strong>2. Feign超时</strong></p><p>连接超时<code>ConnectTimeout</code>和读超时<code>ReadTimeout</code></p><ul><li>配置文件指定</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>feign:
  client:
    config:
      default:
        connectTimeout: 10000
        readTimeout: 10000
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>配置类指定</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>//连接超时ConnectTimeout和读超时ReadTimeout
    @Bean
    public static Request.Options requestOptions(ConfigurableEnvironment env) {
        return new Request.Options(10000, 10000);
    }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. GZIP压缩支持</strong></p><p>Spring Cloud Feign 支持请求和响应进行GZIP压缩来提高通信效率, 开启GZIP压缩配置：</p><ol><li>配置文件指定</li></ol><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>feign:
  compression:
    request:
      # 开启请求压缩
      enabled: true
      # 配置压缩的 MIME TYPE
      mime-types: text/xml,application/xml,application/json
      # 配置压缩数据大小的下限
      min-request-size: 2048
    response:
      # 开启响应压缩
      enabled: true
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 日志级别支持</strong></p><p>在发送和接收请求的时候，Feign定义了日志的输出定义了四个等级：这里我们配置测试一下。</p><table><thead><tr><th style="text-align:left;">级别</th><th style="text-align:left;">说明</th></tr></thead><tbody><tr><td style="text-align:left;">NONE</td><td style="text-align:left;">不做任何记录</td></tr><tr><td style="text-align:left;">BASIC</td><td style="text-align:left;">只记录输出Http 方法名称、请求URL、返回状态码和执行时间</td></tr><tr><td style="text-align:left;">HEADERS</td><td style="text-align:left;">记录输出Http 方法名称、请求URL、返回状态码和执行时间 和 Header 信息</td></tr><tr><td style="text-align:left;">FULL</td><td style="text-align:left;">记录Request 和Response的Header，Body和一些请求元数据</td></tr></tbody></table><ul><li>在application.yml配置文件中开启日志级别配置</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>logging.level:
    com.itheima: debug
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div></div></div><ul><li>编写配置类，定义日志级别bean。</li></ul><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>
@Configuration
public class FeignConfig {
   /**
        *
        *    Logger.Level 的具体级别
        *    NONE：不记录任何信息。
        *    BASIC:  仅记录请求方法，URL以及响应状态码和执行时间。
        *    HEADERS:  除了记录BASIC级别的信息外，还会记录请求和响应的头信息。
        *    FULL:  记录所有请求与响应的明细，包括头信息，请求体，元数据。
        *
        */
    @Bean
    Logger.Level feignLoggerLevel() {

        return Logger.Level.HEADERS;
    }
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 在接口的@FeignClient中指定配置类</strong></p><p>指定configuration = FeignConfig.class</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 在接口上加＠FeignClient 声明一个Feign Client,其中value 为远程调用其他服务的服务名，
 * configuration为配置类
 */
@FeignClient(value = &quot;eureka-client-feign&quot;, configuration = FeignConfig.class)
public interface EurekaClientFeign 
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 效果如下图</strong></p><figure><img src="https://gaofee.cc/images/202303171136857.png" alt="1569305486394" tabindex="0" loading="lazy"><figcaption>1569305486394</figcaption></figure><p><strong>7. 负载均衡</strong></p><ol><li>Feign内部集成Ribbon，使用默认的负载均衡策略；</li></ol><p>FeignRibbonClientAutoConfiguration 类配置了Client 的类型（包括HttpURLConnection 、OkHIttp 和HttpClient ）最终向容器注入的是Client 的实现类LoadBalancerFeignClient ，即负载均衡客户端</p><p><strong>8.重试机制</strong></p><p>Feign重试机制可通过自定义的形式进行指定，可覆盖Retryer的bean自定义重试机制，可以设置重试时间间隔、重试次数（参见下面的快速入门），下面的代码会详细的介绍Feign调用重试。</p><h2 id="_6-3-feign快速入门" tabindex="-1"><a class="header-anchor" href="#_6-3-feign快速入门" aria-hidden="true">#</a> 6.3 Feign快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立五个Module，父Module是itheima-chapter-06，里面没有任何代码，它用来管理我们的聚合工程。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>	&lt;module&gt;eureka-client-feign&lt;/module&gt;
	&lt;module&gt;eureka-client-feign-backup&lt;/module&gt;
	&lt;module&gt;eureka-server-feign&lt;/module&gt;
	&lt;module&gt;feign-client&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>eureka-client-feign、eureka-client-feign-backup是服务注册中心客户端</p><p>eureka-server-feign是服务注册中心服务端</p><p>上面eureka代码直接复制第二章节Eureka章节itheima-chapter-02的代码，只是修改了Module名字，其他没有做任何改变。</p><p>feign-client是服服务调用的具体实现</p><p><strong>具体场景：</strong></p><p>将eureka-client-feign、eureka-client-feign-backup注册到服务端，通过feign-client实现声明式服务调用</p><p>章节代码：itheima-chapter-06,工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171136858.png" alt="1569724387360" tabindex="0" loading="lazy"><figcaption>1569724387360</figcaption></figure><p><strong>1. 创建服务调用模块</strong></p><p>创建feign-client模块，使用Feign来远程调用其他微服务</p><p><strong>2. 引入Feign起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring-cloud-starter-openfeign&lt;/artifactId&gt;
        &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: feign-client
server:
  port: 8765

eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 开启Feign服务调用</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients //开启FeignClient功能
public class EurekaFeignClientApplication {
    public static void main(String[] args) {
        SpringApplication.run(EurekaFeignClientApplication.class, args);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 自定义重试机制</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>//配置类，重写FeignClientConfiguration的重试bean
@Configuration
public class FeignConfig {
    @Bean
    public Retryer getRetryer() {
        //feign重试间隔100毫秒、最大1秒，重试5次
        return new Retryer(100, SECONDS.toMillis(1), 5);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 创建Feign调用接口</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@FeignClient(value = &quot;eureka-client-feign&quot;)
public interface EurekaClientFeign {

    /**
     * 在EurekaClientFeign 接口内部有一个sayHiFromClientEureka（）方法，该方法通过Feign 来调用eureka-client 服务的“/hi”的API 接口
     *
     * @param name
     * @return
     */
    @GetMapping(value = &quot;/hi&quot;)
    String sayHiFromClientEureka(@RequestParam(value = &quot;name&quot;) String name);
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>7. 创建Feign调用类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@Service
public class HiService {

    @Autowired
    EurekaClientFeign eurekaClientFeign;

    /**
     * HiService 类注入EurekaClientFeign的Bean ，通过EurekaClientFeign去调用sayHiFromClientEureka（）方法
     *
     * @param name
     * @return
     */
    public String sayHi(String name) {
        return eurekaClientFeign.sayHiFromClientEureka(name);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. 访问入口</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 在Hi Controller 上加上＠RestController 注解，开启RestController 的功能，写一个API 接口“/hi”，在该接口调用了Hi Service 的sayHi （）方法。
 * HiService 通过EurekaClientFeign 远程调用eureka-client 服务的API 接口&quot;/hi&quot;
 */
@RestController
public class HiController {
    @Autowired
    HiService hiService;
    @GetMapping(&quot;/hi&quot;)
    public String sayHi(@RequestParam(defaultValue = &quot;itheima&quot;, required = false) String name) {
        return hiService.sayHi(name);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>9. 启动</strong></p><p>启动eureka-client-feign、eureka-client-feign-backup、eureka-server-feign、feign-client</p><figure><img src="https://gaofee.cc/images/202303171136859.png" alt="1569058516895" tabindex="0" loading="lazy"><figcaption>1569058516895</figcaption></figure>`,77),o={href:"http://localhost:8765/hi",target:"_blank",rel:"noopener noreferrer"},u=t(`<figure><img src="https://gaofee.cc/images/202303171136860.png" alt="1569058172319" tabindex="0" loading="lazy"><figcaption>1569058172319</figcaption></figure><p>通过Feign进行服务与服务之间调用会轮流（负载均衡：默认轮询）显示以下信息</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>hi itheima,i am from port:8763

hi itheima,i am from port:8769
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_6-4-总结" tabindex="-1"><a class="header-anchor" href="#_6-4-总结" aria-hidden="true">#</a> 6.4 总结</h2><p>第六章节总结：本章节主要介绍了Feign，首先要在程序的入口加入@EnableFeignClients开启Feign，然后需要定义一个接口@FeignClient(value = &quot;eureka-client-feign&quot;)，通过注解的value（也可以是name）用来远程调用服务</p><p>eureka-client-feign，此处我们把eureka-client-feign定义了两个实例eureka-client-feign-backup同时注册到Eureka上，Feign通过负载均衡机制调用服务，在浏览器中可以看到循环显示短裤为8763和8769，由此可以证明Feign利用了默认负载均衡策略轮询的机制加载服务。</p><h1 id="_7-hystrix熔断器" tabindex="-1"><a class="header-anchor" href="#_7-hystrix熔断器" aria-hidden="true">#</a> 7 Hystrix熔断器</h1><h2 id="_7-1-hystrix概述" tabindex="-1"><a class="header-anchor" href="#_7-1-hystrix概述" aria-hidden="true">#</a> 7.1 Hystrix概述</h2><p><strong>1. Hystrix简介</strong></p><p>Hystrix是Netflix公司的一个开源项目，在分布式环境中，许多服务依赖项中的一些必然会失败，Hystrix主要作用是通过控制那些访问远程系统、服务和第三方库的节点，从而对延迟和故障提供更强大的容错能力，而有效减少微服务中雪崩发生 ， 提高系统的整体性能。</p><p><strong>2. Hystrix工作原理</strong></p><img src="https://gaofee.cc/images/202303171136861.png" alt="1244002-20180620140242940-1839503341" style="zoom:67%;"><p><strong>Hystrix Metrics解释：</strong></p><p>Metrics中保存了当前服务的健康状况, 包括服务调用总次数和服务调用失败次数等. 根据Metrics的计数, 熔断器从而能计算出当前服务的调用失败率, 用来和设定的阈值比较从而决定熔断器的状态切换逻辑. 因此Metrics的实现非常重要.</p><p><strong>Hystrix调用流程解释（参照上图）</strong></p><p>构建Hystrix的Command对象, 调用执行方法. Hystrix检查当前服务的熔断器开关是否开启, 若开启, 则执行降级服务getFallback方法. 若熔断器开关关闭, 则Hystrix检查当前服务的线程池是否能接收新的请求, 若超过线程池已满, 则执行降级服务getFallback方法. 若线程池接受请求, 则Hystrix开始执行服务调用具体逻辑run方法. 若服务执行失败, 则执行降级服务getFallback方法, 并将执行结果上报Metrics更新服务健康状况. 若服务执行超时, 则执行降级服务getFallback方法, 并将执行结果上报Metrics更新服务健康状况. 若服务执行成功, 返回正常结果. 若服务降级方法getFallback执行成功, 则返回降级结果. 若服务降级方法getFallback执行失败, 则抛出异常</p><p><strong>3.Hystrix设计原则</strong></p><p>总的来说， Hystrix 的设计原则如下。 ​防止单个服务的故障耗尽整个服务的Servlet 容器（例如Tomcat ）的线程资源。 快速失败机制，如果某个服务出现了故障，则调用该服务的请求快速失败，而不是线程等待。 提供回退（ fallback ）方案，在请求发生故障时，提供设定好的回退方案。 使用熔断机制，防止故障扩散到其他服务。 提供熔断器的监控组件Hystrix Dashboard，可以实时监控熔断器的状态。</p><p><strong>4. Hystrix业务能力</strong></p><p><strong>限流</strong></p><ul><li>这里的限流与 Guava 的 RateLimiter 的限流差异比较大，一个是为了“保护自我”，一个是“保护下游”</li><li>当对服务进行限流时，超过的流量将直接 Fallback，即熔断。而 RateLimiter 关心的其实是“流量整形”，将不规整流量在一定速度内规整</li></ul><p><strong>熔断</strong></p><ul><li>当我的应用无法提供服务时，我要对上游请求熔断，避免上游把我压垮</li><li>当我的下游依赖成功率过低时，我要对下游请求熔断，避免下游把我拖垮</li></ul><p><strong>降级</strong></p><ul><li>降级与熔断紧密相关，熔断后业务如何表现，约定一个快速失败的 Fallback，即为服务降级</li></ul><p><strong>隔离</strong></p><ul><li>业务之间不可互相影响，不同业务需要有独立的运行空间</li><li>最彻底的，可以采用物理隔离，不同的机器部</li><li>采用进程隔离，一个机器多个 Tomcat,请求隔离</li><li>由于 Hystrix 框架所属的层级为代码层，所以实现的是请求隔离，线程池或信号量</li></ul><h2 id="_7-2-雪崩效应介绍" tabindex="-1"><a class="header-anchor" href="#_7-2-雪崩效应介绍" aria-hidden="true">#</a> 7.2 雪崩效应介绍</h2><p><strong>1.下图主要描述了产生雪崩效应的流程图</strong></p><p>B服务调用A服务，A服务不可用，导致B服务不停重试和阻塞，最后B服务变为不可用</p><p>c服务调用B服务，B服务不可用，导致C服务不停重试和阻塞，最后C服务变为不可用</p><p>至此，所有服务均不可用，产生了服务雪崩效应</p><img src="https://gaofee.cc/images/202303171136862.png" alt="af336604-043a-362b-9e9c-63adaffd7b64" style="zoom:67%;"><p>雪崩形成大致可以分成三个阶段（造成雪崩的原因）：</p><p><strong>服务提供者不可用</strong> 原因有： 硬件故障: 硬件故障可能为硬件损坏造成的服务器主机宕机, 网络硬件故障造成的服务提供者的不可访问. 程序Bug: 缓存击穿缓存击穿一般发生在缓存应用重启, 所有缓存被清空时,以及短时间内大量缓存失效时. 大量的缓存不命中, 使请求直击后端,造成服务提供者超负荷运行,引起服务不可用. 用户大量请求：在秒杀和大促开始前,如果准备不充分,用户发起大量请求也会造成服务提供者的不可用. <strong>重试加大流量</strong> 原因有: 用户重试：在服务提供者不可用后, 用户由于忍受不了界面上长时间的等待,而不断刷新页面甚至提交表单. 代码逻辑重试：服务调用端的会存在大量服务异常后的重试逻辑. <strong>服务调用者不可用</strong> 原因有： 同步等待造成的资源耗尽: 当服务调用者使用 同步调用 时, 会产生大量的等待线程占用系统资源. 一旦线程资源被耗尽,服务调用者提供的服务也将处于不可用状态, 于是服务雪崩效应产生了.</p><p><strong>2. 雪崩场景</strong></p><p>分布式架构中的应用程序具有几十个依赖关系，每个依赖关系在某个时刻将不可避免的出现异常。如果应用程序不与这些外部故障隔离，则可能出现线程池阻塞，<strong>引起系统雪崩</strong>。</p><p>例如，对于依赖30个服务的应用程序，每个服务的正常运行时间为99.99％，对于单个服务来说， 99.99% 的可用是非常完美的。</p><p>比如： 99.99%的30次方 = 99.7％正常运行时间和0.3% 的不可用时间，那么10 亿次请求中有3000000次失败，实际的情况可能比这更糟糕（0.3％的10亿次请求= 3,000,000次故障）</p><p>如果不设计整个系统的韧性，即使所有依赖关系表现良好，单个服务只有0.01% 的不可用，由于整个系统的服务相互依赖，最终对整个系统的影响是非常大的。</p><p>在微服务系统中， 一个用户请求可能需要调用几个服务才能完成。如下图，在所有的服务都处于可用状态时， 一个用户请求需要调用A 、H 、I 和P 服务。 <img src="https://gaofee.cc/images/202303171136863.png" alt="1569084490481" loading="lazy"></p><p>当某一个服务，例如服务I，出现网络延迟或者故障时，即使服务A 、H 和P 可用，由于服务I 的不可用，整个用户请求会处于阻塞状态，并等待服务I 的响应（如下图）。</p><pre><code>在高并发的情况下，单个服务的延迟会导致整个请求都处于延迟状态，可能在几秒钟就使整个服务处于线程负载饱和的状态。某个服务的单个点的请求故障会导致用户的请求处于阻塞状态，最终的结果就是整个服务的线程资源消耗殆尽。由于服务的依赖性，会导致依赖于该故障服务的其他服务也处于线程阻塞状态，最终导致这些服务的线程资源消耗殆尽， 直到不可用，从而导致整个问服务系统都不
可用，即雪崩效应。 为了防止雪崩效应，因而产生了熔断器模型。Hystrix 是在业界表现非常好的一个熔断器模型实现的开源组件，它是Spring Cloud 组件不可缺少的一部分。
</code></pre><figure><img src="https://gaofee.cc/images/202303171136864.png" alt="1569084615970" tabindex="0" loading="lazy"><figcaption>1569084615970</figcaption></figure><p>上图描述的是当某个服务发生故障时（服务I故障）结构图</p><p><strong>3. 服务雪崩如何解决</strong></p><p>针对常见原因我们有相应的应对策略：</p><ol><li><p>服务集群</p></li><li><p>限制访问</p></li><li><p>监控程序异常修改程序</p></li><li><p>定时缓存，异步缓存分析雪崩的本质原因：某些依赖服务不可用，导致其他服务等待甚至服务不可用。</p><p>我们设想其他解决方案：如果某个依赖服务不可用，当前的服务能感知到这个依赖服务不可用；从而做出避免自己不可用的措施，那就能尽可能的避免雪崩效应。这就是我们的主角Hystrix 擅长的事。</p></li></ol><h2 id="_7-3-hystrix快速入门-使用feign" tabindex="-1"><a class="header-anchor" href="#_7-3-hystrix快速入门-使用feign" aria-hidden="true">#</a> 7.3 Hystrix快速入门（使用Feign）</h2><p><strong>本章节场景：</strong></p><p>我们将建立五个Module，父Module是itheima-chapter-07，里面没有任何代码，它用来管理我们的聚合工程。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>			&lt;module&gt;eureka-client-hystrix&lt;/module&gt;
			&lt;module&gt;eureka-server-hystrix&lt;/module&gt;
			&lt;module&gt;eureka-ribbon-client&lt;/module&gt;
			&lt;module&gt;eureka-feign-client&lt;/module&gt;
			&lt;module&gt;eureka-monitor-client&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>eureka-client-hystrix是服务注册中心客户端</p><p>eureka-server-hystrix是服务注册中心服务端</p><p>上面eureka代码直接复制第二章节Eureka章节itheima-chapter-02的代码，只是修改了Module名字，其他没有做任何改变。</p><p>eureka-feign-client是Feign的具体实现</p><p>eureka-monitor-client是监控的具体实现</p><p>eureka-ribbon-client是ribbon+restTemplate的具体实现</p><p>具体场景分为五部分</p><p>1、eureka-client-hystrix注册到eureka-server-hystrix</p><p>2、使用Feign实现熔断</p><p>3、使用Ribbon+RestTemplate实现熔断</p><p>4、使用 Hystrix Dashboard实现监控</p><p>5、使用Turbine聚合监控 实现聚合监控</p><p>章节代码：itheima-chapter-07,工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171136865.png" alt="1569324014185" tabindex="0" loading="lazy"><figcaption>1569324014185</figcaption></figure><p><strong>创建Feign模块</strong></p><p>创建模块eureka-feign-client，实现Feign+Hystrix功能</p><p><strong>1. 引入Feign、Hystrix起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>   	            &lt;dependency&gt;
        			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
        			&lt;artifactId&gt;spring-cloud-starter-openfeign&lt;/artifactId&gt;
        		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>2**. 修改application.yml**</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>        spring:
          application:
            name: eureka-feign-client
        server:
          port: 8765

        eureka:
          client:
            serviceUrl:
              defaultZone: http://localhost:8761/eureka/
        # Feign 的起步依赖中已经包含Hystrix依赖，所以只要在配置文件中开启Hystrix的功能就可以
        feign:
          hystrix:
            enabled: true
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 启动Feign</strong></p><p>在EurekaFeignClientApplication上增加@EnableEurekaClient开启 Eureka Client的功能,增@EnableFeignClients开启FeignClient功能</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableEurekaClient
@EnableFeignClients
public class EurekaFeignClientApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaFeignClientApplication.class, args);
	}
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 创建EurekaClientFeign接口</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 在接口上加＠FeignClient 注解来声明一个Feign Client
 * 其中value(可以是name)为远程调用其他服务的服务名， FeignConfig.class 为Feign Client 的配置类
 * ＠FeignClient的fallback配置快速失败的处理类HiHystrix.class
 * ＠FeignClient的fconfiguration为配置类，必须在类加上@Configuration，表明是一个配置类
 *
 */
@FeignClient(value = &quot;eureka-client&quot;, configuration = FeignConfig.class, fallback = HiHystrix.class)
public interface EurekaClientFeign {

    /**
     * 通过Feign 来调用eureka-client 服务的“/hi”的API 接口
     */
    @GetMapping(value = &quot;/hi&quot;)
    String sayHiFromClientEureka(@RequestParam(value = &quot;name&quot;) String name);
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 创建HiHystrix类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * HiHystrix实现Feign服务调用接口，加上@Component注解，将此对象注入到IOC容器中
 */
@Component
public class HiHystrix implements EurekaClientFeign {
    @Override
    public String sayHiFromClientEureka(String name) {
        return &quot;hi,&quot;+name+&quot;,sorry,error!&quot;;
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 创建HiService类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@Service
public class HiService {
    @Autowired
    EurekaClientFeign eurekaClientFeign;

    /**
     * 将EurekaClientFeign注入到当前类，用来调用sayHiFromClientEureka方法
     *
     * @param name
     * @return
     */
    public String sayHi(String name) {
        return eurekaClientFeign.sayHiFromClientEureka(name);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>7. 创建FeignConfig配置类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@Configuration
public class FeignConfig {
  /**
     * 在该类中注入Retryer的Bean ，覆盖掉默认的Retryer的Bean，重置默认的自定义重试机制。
     * 例如Feign 默认的配置在请求失败后， 重试次数为0 ，即不重试（ Retry er.NEVER_RETRY ）。
     * 更改为 FeignClient请求失败后重试： 重试间隔为100毫秒，最大重试时间为1秒，重试次数5次。
     *
     * @return
     */
    @Bean
    public Retryer feignRetryer() {
        return new Retryer.Default(100, SECONDS.toMillis(1), 5);
    }

}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. 创建入口HiController类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 在Hi Controller 上加上＠RestController 注解，开启RestController 的功能，
 * HiService 通过EurekaClientFeign 远程调用eureka-client-feign 服务的API 接口&quot;/hi&quot;
 */
@RestController
public class HiController {
    @Autowired
    HiService hiService;

    @GetMapping(&quot;/hi&quot;)
    public String sayHi(@RequestParam(defaultValue = &quot;itheima&quot;, required = false) String name) {
        return hiService.sayHi(name);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>9. 启动</strong></p><p>分别启动 eureka-server、eureka-client-hystrix、eureka-feign-client，如下图</p><figure><img src="https://gaofee.cc/images/202303171136866.png" alt="1569205448613" tabindex="0" loading="lazy"><figcaption>1569205448613</figcaption></figure><p><strong>10. 访问</strong></p>`,89),g={href:"http://localhost:8765/hi%EF%BC%8C%E6%98%BE%E7%A4%BA%E5%A6%82%E4%B8%8B%E5%86%85%E5%AE%B9%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},p=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136867.png",alt:"1569205581084",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569205581084")],-1),m={href:"http://localhost:8765/hi?name=itheima%EF%BC%8C",target:"_blank",rel:"noopener noreferrer"},b=t(`<p><img src="https://gaofee.cc/images/202303171136868.png" alt="1569205807277" loading="lazy">由此可见， 当eureka-client-hystrix 不可用时，调用eureka-feign-client 的“hi＂接口会进入HiService 类的“/hi”方法中，由于eureka-client-hystrix 没有响应，开启了熔断器， 最后进入了快速失败fallback 的逻辑处理类即HiHystrix，熔断发挥作用。</p><h2 id="_7-4-hystrix快速入门-使用ribbon-resttemplate" tabindex="-1"><a class="header-anchor" href="#_7-4-hystrix快速入门-使用ribbon-resttemplate" aria-hidden="true">#</a> 7.4 Hystrix快速入门(使用Ribbon+RestTemplate)</h2><p><strong>1.创建模块</strong></p><p>创建eureka-ribbon-client 模块，使用Ribbon+RestTemplate中使用Hystrix</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>
           &lt;dependency&gt;
              &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
               &lt;artifactId&gt;spring-cloud-starter-netflix-hystrix&lt;/artifactId&gt;
              &lt;/dependency&gt;

            &lt;dependency&gt;
            	&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            	&lt;artifactId&gt;spring-cloud-starter-netflix-ribbon&lt;/artifactId&gt;
            &lt;/dependency&gt;
            &lt;dependency&gt;
            	&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            	&lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
            &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
   application:
     name: eureka-ribbon-client

 server:
    port: 8764

  eureka:
     client:
        service-url:
           defaultZone: http://localhost:8761/eureka/
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 启动熔断器</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 在EurekaRibbonClientApplication上增加@EnableEurekaClient开启
 * Eureka Client的功能,增加@EnableHystrix功能开启Hystrix熔断器功能
 */
@SpringBootApplication
@EnableEurekaClient
@EnableHystrix
public class EurekaRibbonClientApplication {

    public static void main(String[] args) {

        SpringApplication.run(EurekaRibbonClientApplication.class, args);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 创建RibbonConfig配置类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 加入@Configuration表明当前类为配置类
 */
@Configuration
public class RibbonConfig {

    /**
     * 为IoC 容器中注入一个RestTemplate 的Bean
     * 并在这个Bean 上加上@LoadBalanced 注解，此时RestTemplate 就结合了
     * Ribbon 开启了负载均衡功能。
     *
     * @return
     */
    @Bean
    @LoadBalanced
    RestTemplate restTemplate() {
        return new RestTemplate();
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 创建RibbonService类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@Service
public class RibbonService {

    @Autowired
    RestTemplate restTemplate;

    /**
     * 在该类的hi()方法用restTemplate调用eureka-client-hystrix的API接口
     * Uri 上不需要使用硬编码（比如IP），只需要写服务名eureka-client即可
     * 程序会根据服务名称 eureka-client到Eureka-server注册中心去自动获取IP和端口信息。
     * &lt;p&gt;
     * &lt;p&gt;
     * 在hi()方法上加＠HystrixCommand 注解 hi()方法就启用Hystrix 熔断器的功能，
     * 其中， fallbackMethod 为快速失败（ fallback ）逻辑的方法。
     *
     * @param name
     * @return
     */
    @HystrixCommand(fallbackMethod = &quot;hiError&quot;)
    public String hi(String name) {
        return restTemplate.getForObject(&quot;http://eureka-client-hystrix/hi?name=&quot; + name, String.class);
    }

    /**
     * 快速失败（ fallback ）逻辑的方法。
     *
     * @param name
     * @return
     */
    public String hiError(String name) {
        return &quot;Hi,&quot; + name + &quot;, sorry, error!&quot;;
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>7. 创建RibbonController类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * 加上＠RestController 注解，开启RestController 的功能
 */
@RestController
public class RibbonController {

    /**
     * 调用RibbonService 类的hi（）方法
     */
    @Autowired
    RibbonService ribbonService;
    @Autowired
    private LoadBalancerClient loadBalancer;

    @GetMapping(&quot;/hi&quot;)
    public String hi(@RequestParam(required = false, defaultValue = &quot;itheima&quot;) String name) {
        return ribbonService.hi(name);
    }

    /**
     * 通过LoadBalancerClient 去选择一个eureka-client-hystrix 的服务实例的信息， 并将该信息返回
     */
    @GetMapping(&quot;/testRibbon&quot;)
    public String testRibbon() {
        ServiceInstance instance = loadBalancer.choose(&quot;eureka-client-hystrix&quot;);
        return instance.getHost() + &quot;:&quot; + instance.getPort();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. 启动</strong></p><p>分别启动 eureka-server、eureka-client-hystrix、eureka-ribbon-client，如下图</p><figure><img src="https://gaofee.cc/images/202303171136869.png" alt="1569207759604" tabindex="0" loading="lazy"><figcaption>1569207759604</figcaption></figure><p><strong>9. 访问</strong></p>`,20),h={href:"http://localhost:8764/hi?name=itheima%EF%BC%8C",target:"_blank",rel:"noopener noreferrer"},f=t(`<figure><img src="https://gaofee.cc/images/202303171136870.png" alt="1569207828513" tabindex="0" loading="lazy"><figcaption>1569207828513</figcaption></figure><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>关闭eureka-client-hystrix服务， 浏览器会显示如下信息：
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><figure><img src="https://gaofee.cc/images/202303171136871.png" alt="1569207892778" tabindex="0" loading="lazy"><figcaption>1569207892778</figcaption></figure><p>由此可见， 当eureka-client-hystrix不可用时，调用eureka-ribbon-client 的hi接口会进入RibbonService 类的“/hi”方法中。由于eureka-client-hystrix 没有响应，开启了熔断器， 最后进入了fallbackMethod 的逻辑</p><h2 id="_7-5-hystrixr熔断监控" tabindex="-1"><a class="header-anchor" href="#_7-5-hystrixr熔断监控" aria-hidden="true">#</a> 7.5 Hystrixr熔断监控</h2><h3 id="_7-5-1-hystrix-dashboard监控" tabindex="-1"><a class="header-anchor" href="#_7-5-1-hystrix-dashboard监控" aria-hidden="true">#</a> <strong>7.5.1 Hystrix Dashboard监控</strong></h3><p>修改上面的模块eureka-feign-client（和eureka-ribbon-client修改方法一样，此处只介绍eureka-feign-client的配置方法） 这里说下如何实现Hystrix dashboard监控，步骤如下：</p><p><strong>1. 修改模块eureka-feign-client</strong></p><p>在eureka-feign-client入口类加上注解 @EnableHystrixDashboard，开启仪表盘</p><p><strong>2.增加Hystrix Dashboard监控起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>	&lt;!-- feign 打开 Hystrix Dashboard 必须显示依赖下面3个引用--&gt;
		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
			&lt;artifactId&gt;spring-boot-starter-actuator&lt;/artifactId&gt;
		&lt;/dependency&gt;

		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-netflix-hystrix&lt;/artifactId&gt;
		&lt;/dependency&gt;

		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-netflix-hystrix-dashboard&lt;/artifactId&gt;
		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 新建servlet</strong></p><p>注入ServletRegistrationBean的Bean，代码如下</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@Component
public class HystrixStreamServlet {

    @Bean
    public ServletRegistrationBean getServlet() {
        HystrixMetricsStreamServlet streamServlet = new HystrixMetricsStreamServlet();
        ServletRegistrationBean registrationBean = new ServletRegistrationBean(streamServlet);
        registrationBean.setLoadOnStartup(1);
        registrationBean.addUrlMappings(&quot;/hystrix.stream&quot;);
        registrationBean.setName(&quot;HystrixMetricsStreamServlet&quot;);
        return registrationBean;
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>创建servlet重新初始化ServletRegistrationBean，设置本地启动和url映射以及默认名称</p><p><strong>4. 访问</strong></p>`,16),x={href:"http://localhost:8765/hystrix.stream%EF%BC%8C%E5%A6%82%E4%B8%8B%E3%80%81",target:"_blank",rel:"noopener noreferrer"},y=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136872.png",alt:"1569223995386",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569223995386")],-1),C=e("p",null,"返回 ping: ping: 或者 data: ping: 代表访问成功。",-1),k={href:"http://localhost:8765/hystrix",target:"_blank",rel:"noopener noreferrer"},_={href:"http://localhost:8765/hystrix.stream",target:"_blank",rel:"noopener noreferrer"},E=t(`<figure><img src="https://gaofee.cc/images/202303171136873.png" alt="1569224107255" tabindex="0" loading="lazy"><figcaption>1569224107255</figcaption></figure><p>显示eureka-feign-client的Hystrix Dashboard 数据</p><h3 id="_7-5-2-turbine聚合监控" tabindex="-1"><a class="header-anchor" href="#_7-5-2-turbine聚合监控" aria-hidden="true">#</a> 7.5.2 Turbine聚合监控</h3><p>Hystrix dashboard只能实现单个微服务的监控，可是一般项目中是微服务是以集群的形式搭建，一个一个的监控不现实。而<code>Turbine</code>的原理是，<strong>建立一个turbine服务，并注册到eureka中，并发现eureka上的hystrix服务。通过配置turbine会自动收集所需hystrix的监控信息，最后通过dashboard展现，以达到集群监控的效果</strong></p><p><strong>简单来说，就是通过注册到注册中心，发现其他服务的hystrix服务，然后进行聚合数据，最后通过自身的端点输出到仪表盘上进行个性化展示,当有新增的应用加入时，我们只需要配置下turbine参数即可。</strong></p><p><strong>1. 创建监控模块</strong></p><p>创建eureka-monitor-client模块，使用Turbine聚合监控多个Hystrix dashboard功能, 此处turbine集群名字为default</p><p><strong>2. 引入Turbine聚合监控起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>  				&lt;dependency&gt;
					&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
					&lt;artifactId&gt;spring-cloud-starter-netflix-hystrix-dashboard&lt;/artifactId&gt;
				&lt;/dependency&gt;

				&lt;dependency&gt;
					&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
					&lt;artifactId&gt;spring-cloud-starter-netflix-turbine&lt;/artifactId&gt;
				&lt;/dependency&gt;

				&lt;dependency&gt;
					&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
					&lt;artifactId&gt;spring-boot-starter-actuator&lt;/artifactId&gt;
				&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application.name: service-turbine
server:
  port: 8769

  # 1. cluster-name-expression指定集群名称，默认表达式appName；此时：turbine.app-config需要配置想要监控的应用名称
  # 2. 当cluster-name-expression: default时，turbine.aggregator.cluster-config可以不写，因为默认就是default
  # 3. 当cluster-name-expression: metadata[&#39;cluster&#39;]时，假设想要监控的应用配置了#eureka.instance.metadata-map.cluster: ABC，则需要配置，同时turbine.aggregator.cluster-#config: ABC
turbine:
  combine-host-port: true
  app-config: eureka-ribbon-client,eureka-feign-client
  cluster-name-expression: new String(&quot;default&quot;)
  aggregator:
    cluster-config: default
  instanceUrlSuffix: /hystrix.stream # 这里必须设置，否则默认程序会读取/actuator/hystrix.stream


eureka:
  client:
    serviceUrl:
      defaultZone: http://localhost:8761/eureka/



</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 启动turbine</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>/**
 * EurekaMonitorClientApplication类需要加上@EnableTurbine @EnableEurekaClient  @EnableHystrixDashboard注解开启对应的功能。
 */
@SpringBootApplication
@EnableTurbine
@EnableEurekaClient
@EnableHystrixDashboard
public class EurekaMonitorClientApplication {

    public static void main(String[] args) {
        SpringApplication.run(EurekaMonitorClientApplication.class, args);
    }
}

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 启动</strong></p><p>分别启动eureka-server-hystrix、eureka-client-hystrix、eureka-ribbon-client, eureka-feign-client, eureka-monitor-client，如下图：</p><figure><img src="https://gaofee.cc/images/202303171136874.png" alt="1569210165675" tabindex="0" loading="lazy"><figcaption>1569210165675</figcaption></figure><p><strong>6. 访问</strong></p><p><strong>1、以下为5个工程对应的端口号：</strong></p><p>eureka-server-hystrix端口8761</p><p>eureka-client-hystrix端口8762</p><p>eureka-ribbon-client 端口8764 通过restTemplate调用eureka-client-hystrix/hi接口</p><p>eureka-feign-client端口8765 通过feign调用eureka-client-hystrix接口</p><p>eureka-monitor-client端口8769</p><p><strong>2、在浏览器上分别访问：</strong></p>`,24),S={href:"http://localhost:8765/hi?name=eureka-feign-client",target:"_blank",rel:"noopener noreferrer"},F={href:"http://localhost:8764/hi?name=eureka-ribbon-client",target:"_blank",rel:"noopener noreferrer"},H={href:"http://localhost:8769/hystrix/",target:"_blank",rel:"noopener noreferrer"},B={href:"http://localhost:8769/turbine.stream%EF%BC%8C%E7%9B%91%E6%8E%A7%E6%97%B6%E9%97%B4%E9%97%B4%E9%9A%942000%E6%AF%AB%E7%A7%92%E5%92%8Ctitle%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},I=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136875.png",alt:"1569210330069",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569210330069")],-1),A=e("p",null,[e("strong",null,"3、点击monitor 查看eureka-ribbon-client和eureka-feign-client的Hystrix Dashboard，如下图：")],-1),R=e("img",{src:"https://gaofee.cc/images/202303171136876.png",alt:"1569225477005",loading:"lazy"},null,-1),w={href:"http://localhost:8765/hi?name=eureka-feign-client",target:"_blank",rel:"noopener noreferrer"},q={href:"http://localhost:8764/hi?name=eureka-ribbon-client",target:"_blank",rel:"noopener noreferrer"},P=t('<p><strong>4、上面的两个url都调用了eureka-client-hystrix，此时将eureka-client-hystrix，服务停掉</strong></p><p>则显示：</p><figure><img src="https://gaofee.cc/images/202303171136877.png" alt="1569225839853" tabindex="0" loading="lazy"><figcaption>1569225839853</figcaption></figure><figure><img src="https://gaofee.cc/images/202303171136878.png" alt="1569225848853" tabindex="0" loading="lazy"><figcaption>1569225848853</figcaption></figure><p>然后在观察下tuibine：如下图</p><figure><img src="https://gaofee.cc/images/202303171136879.png" alt="1569225877661" tabindex="0" loading="lazy"><figcaption>1569225877661</figcaption></figure><ul><li>实心圆：它有颜色和大小之分，分别代表实例的监控程度和流量大小。如上图所示，它的健康度从绿色、黄色、橙色、红色递减。通过该实心圆的展示，我们就可以在大量的实例中快速的发现故障实例和高压力实例。</li><li>曲线：用来记录 2 分钟内流量的相对变化，我们可以通过它来观察到流量的上升和下降趋势。</li></ul><h2 id="_7-6-总结" tabindex="-1"><a class="header-anchor" href="#_7-6-总结" aria-hidden="true">#</a> 7.6 总结</h2><p><strong>当前章节主要学习了Hystrix熔断器，它 的使用具体可以分为两种情况</strong></p><p>1、使用Feign的方式</p><p>2、使用Ribbon+RestTemplate的方式</p><p>在第一种方式中，主要使用到了注解@FeignClient(value = &quot;eureka-client&quot;, configuration = FeignConfig.class, fallback = HiHystrix.class在注解里面指定里fallback，如果服务不可用，将会触发法拉利back回调（降级）操作</p><p>在第二种方式中，主要使用到了@HystrixCommand(fallbackMethod = &quot;hiError&quot;)命令的方式，它是写到方法上的，如果方法出现错误或者网络抖动将会触发fallbackMethod 里面的hiError方法</p><p>熔断监控分为两种方式</p><p>一个是 Hystrix Dashboard监控，它只能监控一个微服务的具体熔断信息，但是在分布式场景中，我们的服务可能至少几十个甚至上百个，如果使用 Hystrix Dashboard监控，是非常不方便，所以当前章节介绍了Turbine聚合监控 ，它完全不受服务数量的限制</p><h1 id="_8-gateway网关" tabindex="-1"><a class="header-anchor" href="#_8-gateway网关" aria-hidden="true">#</a> 8 Gateway网关</h1><h2 id="_8-1-gateway概述" tabindex="-1"><a class="header-anchor" href="#_8-1-gateway概述" aria-hidden="true">#</a> 8.1 Gateway概述</h2><p><strong>1. Gateway简介</strong></p><p>Spring Cloud Gateway是Spring官方基于Spring 5.0，Spring Boot 2.0和Project Reactor等技术开发的网关，Spring Cloud Gateway旨在为微服务架构提供一种简单而有效的统一的API路由管理方式。Spring Cloud Gateway作为Spring Cloud生态系中的网关，目标是替代Netflix ZUUL，其不仅提供统一的路由方式，并且基于Filter链的方式提供了网关基本的功能</p><p><strong>Gateway解决了哪些问题</strong></p><p>Gateway主要解决了路由转发、限流、熔断、权限功能。</p><p><strong>Gateway构建方式</strong></p><ul><li><p>代码实现(不推荐)</p></li><li><p>配置文件实现（推荐)</p></li></ul><p><strong>2. Gateway工作原理</strong></p><p>Spring Cloud Gateway 的工作原理跟 Zuul 的差不多，最大的区别就是 Gateway 的 Filter 只有 pre 和 post 两种。下面我们简单了解一下 Gateway 的工作原理图，如图下图 所示。</p><img src="https://gaofee.cc/images/202303171136880.png" alt="1569085872882" style="zoom:67%;"><p>客户端向 Spring Cloud Gateway 发出请求，如果请求与网关程序定义的路由匹配，则该请求就会被发送到网关 Web 处理程序，此时处理程序运行特定的请求过滤器链。</p><p>过滤器之间用虚线分开的原因是过滤器可能会在发送代理请求的前后执行逻辑。所有 pre 过滤器逻辑先执行，然后执行代理请求；代理请求完成后，执行 post 过滤器逻辑。</p><p><strong>3. Gateway特性</strong></p><ul><li>基于Spring 5，Reactor(模式) 和 SpringBoot 2.0</li><li>能够在任何请求属性上匹配路由</li><li>断言和过滤器是特定于路由的</li><li>Hystrix断路器集成</li><li>SpringCloud DiscoveryClient集成</li><li>易于编写断言和过滤器</li><li>请求速率限制</li><li>路径重写</li></ul><img src="https://gaofee.cc/images/202303171136881.png" alt="1569307343507" style="zoom:50%;"><ul><li>不管是来自客户端的请求，还是服务内部调用。一切对服务的请求都可经过网关。</li><li>网关实现鉴权、动态路由限流等等操作。</li><li>Gateway是我们前端的统一入口</li></ul><h2 id="_8-2-gateway核心" tabindex="-1"><a class="header-anchor" href="#_8-2-gateway核心" aria-hidden="true">#</a> 8.2 Gateway核心</h2><p><strong>1、核心概念</strong></p><ul><li>Route （路由）</li></ul><p>Route 是网关的基础元素，由 ID、目标 URI、断言、过滤器组成。当请求到达网关时，由 Gateway Handler Mapping 通过断言进行路由匹配（Mapping），当断言为真时，匹配到路由。</p><ul><li>Predicate（断言）</li></ul>',37),T={href:"http://c.biancheng.net/java/",target:"_blank",rel:"noopener noreferrer"},M=t(`<ul><li>Filter （过滤器）</li></ul><p>过滤器作为网关的其中一个重要功能，就是实现请求的鉴权。Gateway自带过滤器有几十个，常见自带过滤器有：</p><table><thead><tr><th>过滤器名称</th><th>说明</th></tr></thead><tbody><tr><td>AddRequestHeader</td><td>对匹配上的请求加上Header</td></tr><tr><td>AddRequestParameters</td><td>对匹配上的请求路由</td></tr><tr><td>AddResponseHeader</td><td>对从网关返回的响应添加Header</td></tr><tr><td>StripPrefix</td><td>对匹配上的请求路径去除前缀</td></tr><tr><td>PrefixPath</td><td>对匹配上的请求路径添加前缀</td></tr></tbody></table><p>使用场景：</p><ul><li>请求鉴权：如果没有访问权限，直接进行拦截</li><li>异常处理：记录异常日志</li><li>服务调用时长统计</li></ul><p><strong>2. 过滤器配置</strong></p><p>Gateway有两种过滤器</p><ul><li>局部过滤器：只作用在当前配置的路由上。</li><li>全局过滤器：作用在所有路由上。</li></ul><p>配置全局过滤器步骤(此处配置AddResponseHeader，具体参照上面的表格)：</p><p>1）修改application.yml文件</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
     # 配置全局默认过滤器
      filters:
      # 往响应过滤器中加入信息
        - AddResponseHeader=Hi,itheima
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div>`,11),G={start:"2"},z={href:"http://localhost:8081/demo/hi%EF%BC%8CF12%E6%9F%A5%E7%9C%8B%E5%93%8D%E5%BA%94%E5%A4%B4%E4%BF%A1%E6%81%AF",target:"_blank",rel:"noopener noreferrer"},L=t(`<figure><img src="https://gaofee.cc/images/202303171136882.png" alt="1569306700968" tabindex="0" loading="lazy"><figcaption>1569306700968</figcaption></figure><h2 id="_8-3-gateway断言工厂" tabindex="-1"><a class="header-anchor" href="#_8-3-gateway断言工厂" aria-hidden="true">#</a> 8.3 Gateway断言工厂</h2><p><strong>1. After路由断言</strong></p><p>After Route Predicate Factory，可配置一个UTC时间格式的时间参数，当请求进来的当前时间在路由断言工厂之后会成功匹配，才交给 router去处理。否则则报错，不通过路</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: after_route
        uri: http://httpbin.org:80/get
        predicates:
        - After=2017-01-20T17:42:47.789-07:00[America/Denver]
#        - After=2019-04-1T17:42:47.789-07:00[Asia/Shanghai]
  profiles: after_route

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>2. Between路由断言</strong></p><p>Between路由断言工厂接受两个参数，datetime1和datetime2。该谓词匹配发生在datetime1与datetime2之间请求。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: between_route
        uri: http://httpbin.org/get
        predicates:
        - Between=2017-01-20T17:42:47.789-07:00[America/Denver], 2019-09-21T17:42:47.789-07:00[America/Denver]
  profiles: between_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. Header路由断言</strong></p><p>Header由断言工厂接受两个参数，头名称和正则表达式。这个谓词与给定名称的头匹配，该值与正则表达式匹配。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: header_route
        uri: http://httpbin.org/get
        predicates:
        - Header=X-Request-Id, \\d+
  profiles: header_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. Cookie路由断言</strong></p><p>Cookie路由断言工厂接受两个参数：一个时cookie名字，另一个时值，可以为正则表达式。它用于匹配请求中，带有该名称的cookie和cookie匹配正则表达式的请求。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: cookie_route
        uri: http://httpbin.org:80/get
        predicates:
        - Cookie=flag, ch.p
  profiles: cookie_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. Host 路由断言</strong></p><p>Host路由断言工厂接受一个参数：需要一个参数即hostname。它可以使用. * 等去匹配host。这个参数会匹配请求头中的host的值，一致，则请求正确转发。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: host_route
        uri: http://httpbin.org:80/get
        predicates:
        - Host=**.hadron.cn
  profiles: host_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. Method 路由断言</strong></p><p>Method路由断言工厂接受一个参数：HTTP方法来匹配。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: method_route
        uri: http://httpbin.org:80/post
        predicates:
        - Method=POST
  profiles: method_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>7. Path 路由断言</strong></p><p>Path路由断言工厂接受一个参数：采用Spring PathMatcher 模式</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: path_route
        uri: http://httpbin.org
        predicates:
        - Path=/foo/{segment}
  profiles: path_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. Query路由断言</strong></p><p>Query路由断言工厂接受两个参数：一个必需的参数(param)和一个可选的表达式(regexp)</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: query_route
        uri: http://httpbin.org:80/get
        predicates:
        - Query=flag
  profiles: query_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>9. RemoteAddr路由断言</strong></p><p>RemoteAddr路由断言工厂支持通过设置某个 ip 区间号段的请求才会路由，接受 cidr 符号(IPv4 或 IPv6 )字符串的列表(最小大小 1)</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    gateway:
      routes:
      - id: remoteaddr_route
        uri: http://httpbin.org:80/get
        predicates:
        - RemoteAddr=10.17.36.1/24
  profiles: remoteaddr_route
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><h2 id="_8-4-gateway参数详解" tabindex="-1"><a class="header-anchor" href="#_8-4-gateway参数详解" aria-hidden="true">#</a> 8.4 Gateway参数详解</h2><p><strong>1. default-filters</strong></p><p>默认的过滤器，这是一个全局的过滤器，不属于任何一个route</p><p><strong>2. discovery: locator</strong></p><p>enabled注册中心生效，可以通过注册中心的服务名进行路由转发</p><p><strong>3. id</strong></p><p>表示路由的唯一id</p><p><strong>4. uri</strong></p><p>指向注册中心的服务</p><p><strong>5. predicates</strong></p><p>要进行的断言</p><p><strong>6. Path</strong></p><p>被转发到服务</p><p><strong>7. StripPrefix</strong></p><p>截取url</p><p><strong>8. Custom</strong></p><p>自定义的过滤器</p><p><strong>9. name</strong></p><p>Retry重试</p><h2 id="_8-5-gateway快速入门" tabindex="-1"><a class="header-anchor" href="#_8-5-gateway快速入门" aria-hidden="true">#</a> 8.5 Gateway快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立三个Module，父Module是itheima-chapter-08，里面没有任何代码，它用来管理我们的聚合工程。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>			&lt;module&gt;eureka-server-gateway&lt;/module&gt;
			&lt;module&gt;service-hi&lt;/module&gt; 
			&lt;module&gt;service-gateway&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>eureka-server-gateway是服务注册中心</p><p>上面eureka代码直接复制第二章节Eureka章节itheima-chapter-02的代码，只是修改了Module名字，其他没有做任何改变。</p><p>service-gateway是网关服务</p><p>service-hi 这个服务将通过网关服务调用里面的API</p><p><strong>具体场景：</strong></p><p>将service-gateway、service-hi注册到服务端，通过service-gateway网关服务调用</p><p>章节代码：itheima-chapter-08,工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171136883.png" alt="1569324118728" tabindex="0" loading="lazy"><figcaption>1569324118728</figcaption></figure><p><strong>1.创建Gateway模块</strong></p><p>创建service-gateway模块，端口8081，作为服务网关</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>   &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring-cloud-starter-netflix-eureka-client&lt;/artifactId&gt;
        &lt;/dependency&gt;
        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            &lt;artifactId&gt;spring-cloud-starter-gateway&lt;/artifactId&gt;
        &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 修改application.yml文件</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>server:
  port: 8081

spring:
  application:
    name: gateway-server
  cloud:
    gateway:
      discovery:
        #为true表明Gateway开启服务注册和发现的功能
        locator:
          enabled: false
          #将请求路径上的服务名配置为小写
          lowerCaseServiceId: true
      routes:   #路由
      - id: service-hi
        uri: lb://SERVICE-HI
        predicates:
          - Path=/demo/**
        filters:
          - StripPrefix=1
          - RequestTime=true

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/

logging:
  level:
    org.springframework.cloud.gateway: debug
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 启动入口类</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableEurekaClient
public class ServiceGatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(ServiceGatewayApplication.class, args);
    }

    @Bean
    public RequestTimeGatewayFilterFactory requestTimeGatewayFilterFactory() {
        return new RequestTimeGatewayFilterFactory();
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 启动</strong></p><p>分别启动eureka-server-gateway、service-hi、service-gateway</p><figure><img src="https://gaofee.cc/images/202303171136884.png" alt="1569230428075" tabindex="0" loading="lazy"><figcaption>1569230428075</figcaption></figure><p><strong>6. 访问</strong></p>`,72),D={href:"http://localhost:8762/hi%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},U=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136885.png",alt:"1569230643565",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569230643565")],-1),V={start:"2"},N={href:"http://localhost:8081/demo/hi%E5%A6%82%E4%B8%8B%E5%9B%BE",target:"_blank",rel:"noopener noreferrer"},Z=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136886.png",alt:"1569230654477",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569230654477")],-1),O={href:"http://localhost:8081/demo/hi%E8%AE%BF%E9%97%AE%E7%BD%91%E5%85%B3%EF%BC%8C%E4%B9%9F%E5%90%8C%E6%A0%B7%E8%BE%93%E5%87%BA%E4%BA%86hi",target:"_blank",rel:"noopener noreferrer"},Q=t(`<p>那是因为我们的网关服务service-gateway配置文件application.yml文件中配置了路由转发功能；核心的参数为</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>uri: lb://SERVICE-HIpredicates:  - Path=/demo/** filters: - StripPrefix=1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div></div></div><p>url为指向注册中心的服务，主要是从我们的注册中心获取服务，注册中心可以是多种类型Consul或者Zookeeper</p><p>Path为转发路径</p><p>在上面的配置中，配置了一个Path 的predict,将以/demo/**开头的请求都会转发到uri为lb://SERVICE-HI的地址上，lb://SERVICE-HI即service-hi服务的负载均衡地址，并用StripPrefix的filter 在转发之前将/demo去掉</p><h2 id="_8-6-总结" tabindex="-1"><a class="header-anchor" href="#_8-6-总结" aria-hidden="true">#</a> 8.6 总结</h2><p>当章节主要介绍了Gateway网关，它的出现主要是替代Zull，它的主要功能不仅包含路由转发，比如限流、权限、熔断在Gateway框架中都是支持的，它的主要核心功能主要是两大过滤器（普通过滤器和全局过滤器），这个两个过滤器的区别就是一个是作用于特定路由的，一个是全局的；另外的核心要属它的断言工厂了，目前可以支持8个断言工厂，但是比较常用的还是Path，Method、Query、Head在某些业务场景下也会使用。</p><p>它的实现方式建议使用配置文件方式去做，不推荐使用代码实现去配置它的过滤器、路由和断言工厂</p><p>过滤器还是需要自己写代码的比如权限、限流规则等</p><h1 id="_9-config分布式配置中心" tabindex="-1"><a class="header-anchor" href="#_9-config分布式配置中心" aria-hidden="true">#</a> 9 Config分布式配置中心</h1><h2 id="_9-1-config概述" tabindex="-1"><a class="header-anchor" href="#_9-1-config概述" aria-hidden="true">#</a> 9.1 Config概述</h2><p><strong>1. Config简介</strong></p><p>Spring Cloud Config为分布式系统中的外部配置提供服务器和客户端支持。方便部署与运维。 主要分客户端、服务端。 服务端也称分布式配置中心，是一个独立的微服务应用，用来连接配置服务器并为客户端提供获取配置信息，加密/解密信息等访问接口。 客户端则是通过指定配置中心来管理应用资源，以及与业务相关的配置内容，并在启动的时候从配置中心获取和加载配置信息。支持本地仓库和远程仓库读取</p><p><strong>Config解决了哪些问题</strong>：</p><p>一句话总结，Config分布式配置中心解决了在分布式场景下多环境配置文件的管理和维护</p><p><strong>2. Config Server优点</strong></p><ul><li>集中管理配置文件</li><li>不同环境不同配置，动态化的配置更新</li><li>运行期间，不需要去服务器修改配置文件，服务会想配置中心拉取自己的信息</li><li>配置信息改变时，不需要重启即可更新配置信息到服务</li><li>配置信息以 rest 接口暴露</li></ul><p><strong>3. Config Server功能</strong></p><ul><li>用于外部配置的HTTP，基于资源的API（名称 值对或等效的YAML内容）</li><li>加密和解密属性值（对称或非对称）</li><li>使用可轻松嵌入Spring Boot应用程序</li><li>可以轻松的结合Eureka实现高可用</li><li>可以轻松的结合Spring Cloud Bus实现自动化持续集成</li></ul><p><strong>4. Config Client功能</strong></p><ul><li>绑定到Config Server并Environment使用远程属性源初始化Spring</li><li>加密和解密属性值（对称或非对称）</li><li>结合服务注册中心实现服务发现</li></ul><p><strong>5. Config环境存储库规则</strong></p><p>多环境配置文件命名规则：</p><ul><li><code>{application}</code>，它映射到客户端的<code>spring.application.name</code>。</li><li><code>{profile}</code>，它映射到客户端（逗号分隔列表）的<code>spring.profiles.active</code>。</li><li><code>{label}</code>，这是标记配置文件集“版本化”的服务器端特性。</li></ul><p>存储库实现通常表现得像Spring Boot应用程序，从<code>spring.config.name</code>等于<code>{application}</code>参数，<code>spring.profiles.active</code>等于<code>{profiles}</code>参数加载配置文件。配置文件的优先规则也与常规Spring Boot应用程序中的规则相同：活动配置文件优先于默认配置文件，如果有多个配置文件，则最后一个配置文件获胜（类似于向<code>Map</code>添加条目）。</p><p>以下示例客户端应用程序具有此bootstrap配置：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: foo
  profiles:
    active: dev
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>当前文件激活了dev（开发）文件</p><p><strong>6. Config健健康指示器</strong></p><p>Config Server附带一个健康指示器，用于检查配置的<code>EnvironmentRepository</code>是否正常工作，默认情况下，它会向<code>EnvironmentRepository</code>请求名为<code>app</code>的应用程序、<code>default</code>配置文件以及<code>EnvironmentRepository</code>实现提供的默认标签。</p><p>你可以配置健康指示器以检查更多应用程序以及自定义配置文件和自定义标签，如以下示例所示：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    config:
      server:
        health:
          enabled: true           
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>你可以通过设置<code>spring.cloud.config.server.health.enabled=false</code>来禁用监控指示器。</p><h2 id="_9-2-config快速入门" tabindex="-1"><a class="header-anchor" href="#_9-2-config快速入门" aria-hidden="true">#</a> 9.2 Config快速入门</h2><p><strong>本章节场景：</strong></p><p>我们将建立六个Module，父Module是itheima-chapter-09，里面没有任何代码，它用来管理我们的聚合工程。 eureka-server-config代码直接复制第二章节Eureka章节itheima-chapter-02的代码，只是修改了Module名字，其他没有做任何改变。</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>        &lt;module&gt;config-client&lt;/module&gt;
        &lt;module&gt;config-server&lt;/module&gt;
        &lt;module&gt;eureka-server-config&lt;/module&gt;
        &lt;module&gt;config-client-git&lt;/module&gt;
        &lt;module&gt;config-client-git-backup&lt;/module&gt;
        &lt;module&gt;config-server-git&lt;/module&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>config-client配置中心客户端，用于本地读取 config-server配置中心服务端，用于服务端 config-client-git配置中心客户端。用于远程仓库码云读取 config-client-git-backup配置中心客户端。用于远程仓库码云读取 config-server-git配置中心客户端。用于配置远程仓库码云</p><p><strong>具体场景：</strong> 1、本地文件读取 将eureka-server-config启动 config-client、config-server启动注册到eureka-server-config，然后读取本地文件内容 2、远程仓库码云读取 需要登录码云网站注册账号 将eureka-server-config启动，然后将config-client-git-backup、config-server-git注册到服务注册发现中心 然后读取远程仓库码云上面的文件</p><p>3、远程仓库码云读取端点刷新 针对一个服务，修改了远程码云上的文件后，在不重启服务的情况下，通过暴露的refresh端点进行刷新注册到服务端，通过feign-client实现声明式服务调用</p><p>章节代码：itheima-chapter-09工程结构如下图：</p><figure><img src="https://gaofee.cc/images/202303171136887.png" alt="1569324240453" tabindex="0" loading="lazy"><figcaption>1569324240453</figcaption></figure><h3 id="_9-2-2-config本地文件读取" tabindex="-1"><a class="header-anchor" href="#_9-2-2-config本地文件读取" aria-hidden="true">#</a> 9.2.2 Config本地文件读取</h3><p><strong>1. 创建Config Server模块</strong></p><p>创建config-server模块，当前模块为配置中心服务端，Config Server从本地读取配置文件</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>  &lt;dependency&gt;
      &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
       &lt;artifactId&gt;spring-cloud-config-server&lt;/artifactId&gt;
   &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 开启Config Server</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>在ConfigServerApplication类上新增@EnableConfigServer注解，开启config server功能。</p><p><strong>4. 修改application.yml文件</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  cloud:
    config:
      server:
        native:  #代表本地
          search-locations: classpath:/shared
  profiles:
     active: native 
  application:
    name: config-server

server:
  port: 8769
#1. spring.profiles.active=native 用来配置Config Server从本地读取配置文件
#2. spring.cloud.config.server.native.search-locations指定配置文件路径
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5 新建目录</strong></p><p>在resources/shared目录下新建config-client-dev.yml配置文件，配置数据如下：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>  server:
    port: 8762

  itheima: itheima version 1
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>6. 创建Config Client模块</strong></p><p>创建config-client模块 ， Config Client 通过调用Config Sever 的H即API 接口来读取配置文件</p><p><strong>7. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code> 				   &lt;dependency&gt;
            			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            			&lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
            		&lt;/dependency&gt;

            		&lt;dependency&gt;
            			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
            			&lt;artifactId&gt;spring-cloud-starter-config&lt;/artifactId&gt;
            		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. 修改bootstrap.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: config-client
  cloud:
    config:
      uri: http://localhost:8769
      fail-fast: true
  profiles:
    active: dev
#配置说明：
# spring.cloud.config.url 指定configServer的访问url
# spring.cloud.config.fail-fast 表示如果没有读取成功，则执行快速失败
# sprisng.profiles.active表示读取dev环境的配置文件
# config-client就会去读config-server/resource/shared目录下面的 config-client-dev.yml文件
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>9. 读取itheima</strong></p><p>在ConfigClientApplication类中写一个API接口，读取配置文件itheima变量</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@RestController
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>10. 启动</strong></p><p>启动config-server工程、config-eureka-config、config-client工程，如下图：</p><figure><img src="https://gaofee.cc/images/202303171136888.png" alt="1569236075656" tabindex="0" loading="lazy"><figcaption>1569236075656</figcaption></figure>`,67),J={href:"http://localhost:8762/itheima%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},$=t(`<figure><img src="https://gaofee.cc/images/202303171136889.png" alt="1569235186353" tabindex="0" loading="lazy"><figcaption>1569235186353</figcaption></figure><p>启动config-client工程会在控制台的日志中发现config-client向url为http://localhost:8769的Config Server读取了配置文件，最终config-client程序启动的端口为87628762端口是在config-server/resource/shared目录中的config-client-dev.yml文件中配置的。由此可以见config-client向config-server中 成功读取配置文件</p><h3 id="_9-2-3-config远程git读取" tabindex="-1"><a class="header-anchor" href="#_9-2-3-config远程git读取" aria-hidden="true">#</a> 9.2.3 Config远程git读取</h3><p><strong>1. 创建Config Server模块</strong></p><p>创建config-server-git模块，当前模块为配置中心服务端，Config Server从远程git读取配置文件</p><p><strong>2. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>      &lt;dependency&gt;
          &lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
           &lt;artifactId&gt;spring-cloud-config-server&lt;/artifactId&gt;
       &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>3. 开启Config Server</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {

    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>4. 修改application.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>server:
  port: 8769
# 从git 仓库读取配置文件的配置项
# GIT目录已经上传config-client-dev.properties文件 该文件没有指定端口 只配置了foo变量
spring:
  cloud:
    config:
      server:
        git:
          #下面的git为码云地址
          uri: https://gitee.com/code80341157/itheima-repository.git
          searchPaths: itheima
          username:
          password:
      label: master
  application:
    name: config-server-git
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: localhost:\${server.port}
#配置说明：
#1. spring.cloud.config.server.git.url配置git仓库地址
#2. spring.cloud.config.server.git.searchPaths配置搜索远程仓库的文件夹地址
#3. spring.cloud.config.server.git.username配置git仓库的登录名
#4. spring.cloud.config.server.git.password配置git仓库的密码 (公开的Git仓库不需要用户名、密码；私人Git仓库需要)
#5. spring.cloud.config.label为git仓库的分支名，本例从master读取。

</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>5. 创建Config Client模块</strong></p><p>创建config-client-git模块</p><p><strong>6. 引入起步依赖</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
			&lt;artifactId&gt;spring-boot-starter-web&lt;/artifactId&gt;
		&lt;/dependency&gt;

		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-config&lt;/artifactId&gt;
		&lt;/dependency&gt;
		&lt;dependency&gt;
			&lt;groupId&gt;org.springframework.cloud&lt;/groupId&gt;
			&lt;artifactId&gt;spring-cloud-starter-netflix-eureka-client&lt;/artifactId&gt;
		&lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>7. 修改bootstrap.yml</strong></p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: config-client-git
  cloud:
    config:
      uri: http://localhost:8769
      fail-fast: true
  profiles:
    active: dev
server:
  port: 8762
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: localhost:\${server.port}
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>8. 读取</strong></p><p>在ConfigClientApplication类中写一个API接口，读取配置文件itheima变量</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
@RestController
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p><strong>9. 上传</strong></p><p>将config-server-git下resource/shared目录中的config-client-git-dev.yml文件上传到码云（也可以是github）</p>`,22),j={href:"https://gitee.com/code80341157/itheima-repository/tree/master/itheima",target:"_blank",rel:"noopener noreferrer"},W=t('<figure><img src="https://gaofee.cc/images/202303171136890.png" alt="1569295057234" tabindex="0" loading="lazy"><figcaption>1569295057234</figcaption></figure><p>点击上传文件</p><figure><img src="https://gaofee.cc/images/202303171136891.png" alt="1569295128625" tabindex="0" loading="lazy"><figcaption>1569295128625</figcaption></figure><p>将config-client-git-dev.yml上传到码云就可以了</p><p><strong>10. 启动</strong></p><p>启动config-server-git、config-eureka-config、config-client-git工程，如下图：</p><figure><img src="https://gaofee.cc/images/202303171136892.png" alt="1569288534862" tabindex="0" loading="lazy"><figcaption>1569288534862</figcaption></figure><p><strong>11. 访问</strong></p>',8),Y={href:"http://localhost:8762/itheima%EF%BC%8C%E6%B5%8F%E8%A7%88%E5%99%A8%E6%98%BE%E7%A4%BA%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},X=t(`<figure><img src="https://gaofee.cc/images/202303171136893.png" alt="1569288649709" tabindex="0" loading="lazy"><figcaption>1569288649709</figcaption></figure><p>远程仓库（码云）<strong>config-client-git-dev.yml</strong>数据</p><figure><img src="https://gaofee.cc/images/202303171136894.png" alt="1569288613845" tabindex="0" loading="lazy"><figcaption>1569288613845</figcaption></figure><p><strong>由此可见，在访问Config Client时，Config Client成功连接到了Config Server，而Config Server也成功的从码云远程仓库获取到了数据。</strong></p><p><strong>12. 存在刷新问题</strong></p><p>此时，存在一个问题，如果我更改了远程仓库的数据</p><p>将之前的itheima: itheima config server 修改为itheima: itheima config server Version 1.0.0，如下图：</p><figure><img src="https://gaofee.cc/images/202303171136895.png" alt="1569288893342" tabindex="0" loading="lazy"><figcaption>1569288893342</figcaption></figure><p>这个时候，我在<strong>不重启Config Servier的情况</strong>下，在重新获取，如下图：</p><figure><img src="https://gaofee.cc/images/202303171136896.png" alt="1569289003433" tabindex="0" loading="lazy"><figcaption>1569289003433</figcaption></figure><p>我们发现，获取到的数据<strong>不是我们想要的</strong>。</p><p>这个问题如何解决？请继续往下看</p><p><strong>13. 解决刷新问题</strong></p><p>修改我们上面的工程config-client-git，config-server-git保持不变。</p><p>config-client-git引入刷新的起步依赖</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>        &lt;dependency&gt;
            &lt;groupId&gt;org.springframework.boot&lt;/groupId&gt;
            &lt;artifactId&gt;spring-boot-starter-actuator&lt;/artifactId&gt;
        &lt;/dependency&gt;
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>新增@RefreshScope注解，只有加上了该注解，才会在不重启服务的情况下更新配置：</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>@SpringBootApplication
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
</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>config-client-git工程的bootstrap.yml文件暴露刷端点</p><div class="language-text line-numbers-mode" data-ext="text"><pre class="language-text"><code>spring:
  application:
    name: config-client-git
  cloud:
    config:
      uri: http://localhost:8769
      fail-fast: true
  profiles:
    active: dev
server:
  port: 8762
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
  instance:
    prefer-ip-address: true
    instance-id: localhost:\${server.port}
management:
  endpoints:
    web:
      exposure:
        include: refresh


</code></pre><div class="line-numbers" aria-hidden="true"><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div><div class="line-number"></div></div></div><p>此时，重启config-client-git工程，其他先不要从重启，重启成功后，修改码云远程仓库 <strong>config-client-git-dev.yml</strong>的值：itheima: itheima config server Version 2.0.0，如下：</p><figure><img src="https://gaofee.cc/images/202303171136897.png" alt="1569290007786" tabindex="0" loading="lazy"><figcaption>1569290007786</figcaption></figure><p>此时，是无法获取远程仓库最新的值，我们需要执行<strong>最重要的一步</strong>：</p>`,23),K={href:"http://localhost:8762/actuator/refresh%E5%A6%82%E4%B8%8B",target:"_blank",rel:"noopener noreferrer"},ee=e("figure",null,[e("img",{src:"https://gaofee.cc/images/202303171136898.png",alt:"1569295191756",tabindex:"0",loading:"lazy"}),e("figcaption",null,"1569295191756")],-1),ie={href:"http://localhost:8762/itheima%EF%BC%8C%E5%A6%82%E4%B8%8B%E5%9B%BE%EF%BC%9A",target:"_blank",rel:"noopener noreferrer"},ne=t('<figure><img src="https://gaofee.cc/images/202303171136899.png" alt="1569295215776" tabindex="0" loading="lazy"><figcaption>1569295215776</figcaption></figure><p>此时，我们获取到了远程仓库上最新的值。</p><p><strong>14. 利用总线批量刷新问题</strong></p><p>在上面的12节提到利用端点refresh进行刷新，这个操作只能实现针对一个微服务进行刷新。</p><p>在分布式场景中，如果我们的服务非常多，几十个、甚至上百个都是有可能的，如果我们每修改一个配置文件，都要手工去一个一个去刷新，这样工作量会非常非常大，在分布式场景中显然这种方式是不可取的。</p><p>那么，有没有一种方式，刷新一次，所有的微服务全部获取到最新的值呢？</p><p>答案是有的：在下一章节（第十章）我们会利用RabbitMQ+Spring Cloud Bus统一整合</p><p>实现一次改变、所有微服务都可以刷新</p><h2 id="_9-3-总结" tabindex="-1"><a class="header-anchor" href="#_9-3-总结" aria-hidden="true">#</a> 9.3 总结</h2><p>当前章节主要讲解了Config服务配置中心的两种使用方法，第一种方式介绍了利用Config服务配置中心读取本地文件，本地为磁盘上的文件可以是磁盘路径也可以是classpath下面的文件，Config服务配置中心都可以读取；另外一种是Config服务配置中心读取远程仓库的文件，远程仓库可以是任意仓库比如git、码云、svn等等都支持，唯一不同的地方就是在配置文件中配置远程仓库的地址有所不同，其他的处理逻辑和方式都是一样的</p><p>在这两种读取的方式中，如果远程仓库或者本地的文件发生改变，我们都要重启服务，显然在大规模的分布式场景中，这样做是不可取的，暴露refresh端点虽然可以解决我们的问题，但是，它只能针对一个微服务起作用，如果服务数量比较多的情况下还是不能满足我们的需要</p><p>所以，我们可以借助Spring Cloud Bus+RabbitMQ的特性来解决我们这个问题</p><p>Spring Cloud Bus+RabbitMQ我们将在下一章讲解。</p>',13);function le(te,re){const n=d("ExternalLinkIcon");return a(),s("div",null,[v,e("p",null,[i("在浏览器上访问"),e("a",o,[i("http://localhost:8765/hi"),l(n)])]),u,e("p",null,[i("在浏览器上访问"),e("a",g,[i("http://localhost:8765/hi，显示如下内容："),l(n)])]),p,e("p",null,[i("关闭eureka-client服务，在浏览器上访问"),e("a",m,[i("http://localhost:8765/hi?name=itheima，"),l(n)]),i(" 浏览器会显示如下信息：")]),b,e("p",null,[i("在浏览器上访问"),e("a",h,[i("http://localhost:8764/hi?name=itheima，"),l(n)]),i(" 浏览器会显示如下信息：")]),f,e("p",null,[i("此时，Hystrix dashboard已经配置完毕，浏览器输入"),e("a",x,[i("http://localhost:8765/hystrix.stream，如下、"),l(n)])]),y,C,e("p",null,[i("浏览器访问"),e("a",k,[i("http://localhost:8765/hystrix"),l(n)]),i(" ， 在Hystrix DashBoard 输入框中输入： "),e("a",_,[i("http://localhost:8765/hystrix.stream"),l(n)]),i(" 地址，在Title中输入： itheima，点击 Monitor Stream 按钮，显示如下")]),E,e("p",null,[e("a",S,[i("http://localhost:8765/hi?name=eureka-feign-client"),l(n)]),i(" Feing声明式调用服务")]),e("p",null,[e("a",F,[i("http://localhost:8764/hi?name=eureka-ribbon-client"),l(n)]),i(" 使用RestTemplate+Ribbon服务")]),e("p",null,[i("在浏览器访问"),e("a",H,[i("http://localhost:8769/hystrix/"),l(n)]),i(" 进入Hystrix Dashboard界面")]),e("p",null,[i("界面中输入监控的Url地址 "),e("a",B,[i("http://localhost:8769/turbine.stream，监控时间间隔2000毫秒和title，如下图"),l(n)])]),I,A,e("p",null,[R,i("、"),e("a",w,[i("http://localhost:8765/hi?name=eureka-feign-client"),l(n)]),i(" Feing声明式调用服务")]),e("p",null,[e("a",q,[i("http://localhost:8764/hi?name=eureka-ribbon-client"),l(n)]),i(" 使用RestTemplate+Ribbon服务")]),P,e("p",null,[i("Predicate 是 "),e("a",T,[i("Java"),l(n)]),i(" 8 中提供的一个函数。输入类型是 Spring Framework ServerWebExchange。它允许开发人员匹配来自 HTTP 的请求，例如请求头或者请求参数。简单来说它就是匹配条件。")]),M,e("ol",G,[e("li",null,[i("浏览器输入"),e("a",z,[i("http://localhost:8081/demo/hi，F12查看响应头信息"),l(n)])])]),L,e("ol",null,[e("li",null,[i("不使用网关访问service-hi服务，浏览器输入"),e("a",D,[i("http://localhost:8762/hi如下图"),l(n)])])]),U,e("ol",V,[e("li",null,[i("使用网关访问service-hi服务，浏览器输入"),e("a",N,[i("http://localhost:8081/demo/hi如下图"),l(n)])])]),Z,e("p",null,[i("由此可见，我们使用"),e("a",O,[i("http://localhost:8081/demo/hi访问网关，也同样输出了hi"),l(n)]),i(" itheima ,i am from port:8762")]),Q,e("p",null,[i("在浏览器输入"),e("a",J,[i("http://localhost:8762/itheima，如下图："),l(n)])]),$,e("p",null,[i("浏览器输入"),e("a",j,[i("https://gitee.com/code80341157/itheima-repository/tree/master/itheima"),l(n)])]),W,e("p",null,[i("访问"),e("a",Y,[i("http://localhost:8762/itheima，浏览器显示："),l(n)])]),X,e("p",null,[i("通过postman（或curl）工具发送post请求到： "),e("a",K,[i("http://localhost:8762/actuator/refresh如下"),l(n)])]),ee,e("p",null,[i("成功后，然后在去访问"),e("a",ie,[i("http://localhost:8762/itheima，如下图："),l(n)])]),ne])}const se=r(c,[["render",le],["__file","day02-SpringCloud第二阶段.html.vue"]]);export{se as default};
