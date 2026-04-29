<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Message } from "@element-plus/icons-vue";
import request from "@/utils/request";

const router = useRouter();
const loading = ref(false);
const loginFormRef = ref(null);

const loginForm = ref({
  email: "",
  password: "",
  rememberMe: false,
});

onMounted(() => {
  const savedEmail = localStorage.getItem("rem_email");
  const savedPwd = localStorage.getItem("rem_pwd");

  if (savedEmail && savedPwd) {
    loginForm.value.email = savedEmail;
    loginForm.value.password = savedPwd;
    loginForm.value.rememberMe = true;
  }
});

const rules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "请输入正确的邮箱格式", trigger: ["blur", "change"] },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
  ],
};

const login = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
  } catch {
    ElMessage.warning("请完善登录信息");
    return;
  }

  loading.value = true;

  try {
    const res = await request.post("/users/login", {
      email: loginForm.value.email.trim(),
      password: loginForm.value.password,
    });

    if (!res || res.code !== 200) {
      ElMessage.error(res?.message || res?.msg || "邮箱或密码错误");
      return;
    }

    const userData = { ...(res.data?.user || {}) };
    const token = res.data?.token;

    if (!token || !userData.email) {
      ElMessage.error("登录返回数据不完整");
      return;
    }

    if (userData.password) {
      delete userData.password;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("userInfo", JSON.stringify(userData));

    if (loginForm.value.rememberMe) {
      localStorage.setItem("rem_email", loginForm.value.email);
      localStorage.setItem("rem_pwd", loginForm.value.password);
    } else {
      localStorage.removeItem("rem_email");
      localStorage.removeItem("rem_pwd");
    }

    if (userData.status !== "ACTIVE") {
      if (userData.status === "PENDING") {
        ElMessage.warning("账号正在审核中，请稍后再试");
      } else {
        ElMessage.error(`账号状态异常：${userData.status}`);
      }
      return;
    }

    ElMessage.success(res.message || "登录成功");

    if (userData.role === "ADMIN") {
      router.push({ path: "/admin/dashboard" });
    } else {
      router.push({ path: "/user" });
    }
  } catch (error) {
    console.error("登录请求失败:", error);
    ElMessage.error("无法连接到服务器，请检查后端是否启动");
  } finally {
    loading.value = false;
  }
};

const goToRegister = () => {
  router.push({ name: "Register" });
};

const goToForgotPassword = () => {
  router.push({ name: "ForgotPassword" });
};

const options = {
  fpsLimit: 60,
  interactivity: {
    detectsOn: "canvas",
    events: {
      onClick: { enable: true, mode: "push" },
      onHover: { enable: true, mode: "grab" },
      resize: true,
    },
    modes: {
      bubble: { distance: 400, duration: 2, opacity: 0.8, size: 40 },
      push: { quantity: 4 },
      grab: { distance: 200, duration: 0.4 },
      attract: { distance: 200, duration: 0.4, factor: 5 },
    },
  },
  particles: {
    color: { value: "#2F4F4F" },
    links: { color: "#FFFFFF", distance: 150, enable: true, opacity: 0.4, width: 1.2 },
    collisions: { enable: true },
    move: {
      attract: { enable: false, rotateX: 600, rotateY: 1200 },
      bounce: false,
      direction: "none",
      enable: true,
      out_mode: "out",
      random: false,
      speed: 0.5,
      straight: false,
    },
    number: { density: { enable: true, value_area: 800 }, value: 150 },
    opacity: { value: 0.7 },
    shape: { type: "star" },
    size: { value: { min: 1, max: 4 }, random: true, animation: { enable: true, speed: 2, minimumValue: 0.1, sync: false } },
  },
  detectRetina: true,
};
</script>

<template>
  <div class="login">
    <vue-particles id="tsparticles" class="login__particles" :options="options" />

    <div class="loginPart">
      <h2>欢迎登录智能账单管理平台</h2>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="rules"
        label-width="100px"
        style="transform: translate(-30px)"
        @keyup.enter="login"
      >
        <el-form-item label="账号" prop="email">
          <el-input v-model="loginForm.email" placeholder="请输入邮箱" clearable>
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe" style="color: #fff">记住密码</el-checkbox>
        </el-form-item>

        <el-button
          class="btn"
          type="primary"
          native-type="button"
          :loading="loading"
          @click="login"
          auto-insert-space
        >
          登录
        </el-button>

        <div style="text-align: right; transform: translate(0, 30px)">
          <el-link type="danger" @click="goToForgotPassword" style="margin-right: 140px">
            忘记密码？
          </el-link>
          <el-link type="warning" @click="goToRegister">没有账号？去注册</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.login__particles {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("@/assets/loginback.jpg");
  opacity: 0.9;
  position: fixed;
  pointer-events: none;
}

.loginPart {
  position: absolute;
  top: 50%;
  left: 80%;
  transform: translate(-50%, -50%);
  width: 450px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-sizing: border-box;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
}

h2 {
  margin: 0 0 30px;
  padding: 0;
  color: #fff;
  text-align: center;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn {
  transform: translate(170px);
  width: 80px;
  height: 40px;
  font-size: 15px;
}

.el-input__wrapper {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);

  &:hover,
  &:focus-within {
    border-color: rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.2);
  }
}

@media (max-width: 768px) {
  .loginPart {
    left: 50%;
    width: 90%;
    padding: 30px;
  }

  .btn {
    transform: translate(0);
    width: 100%;
  }
}
</style>
