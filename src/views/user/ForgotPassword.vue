<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { Message, Lock } from "@element-plus/icons-vue";

const router = useRouter();

const isTime = ref(true);
const currentTime = ref(60);
const codeLoading = ref(false);
const submitLoading = ref(false);
const formRef = ref(null);

const form = ref({
  email: "",
  code: "",
  newPassword: "",
  confirmPassword: "",
});

const rules = {
  email: [
    { required: true, message: "请输入邮箱地址", trigger: "blur" },
    { type: "email", message: "邮箱格式不正确", trigger: "blur" },
  ],
  code: [
    { required: true, message: "请输入验证码", trigger: "blur" },
    { pattern: /^\d{6}$/, message: "验证码应为 6 位数字", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "密码长度需在 6 到 20 位之间", trigger: "blur" },
  ],
  confirmPassword: [
    { required: true, message: "请确认新密码", trigger: "blur" },
    {
      validator: (_, value, callback) => {
        if (value !== form.value.newPassword) {
          callback(new Error("两次密码输入不一致"));
          return;
        }
        callback();
      },
      trigger: "blur",
    },
  ],
};

const getCode = async () => {
  if (!form.value.email.trim()) {
    ElMessage.warning("请先输入邮箱");
    return;
  }

  ElMessage.info("后端接口待实现：GET /users/send-reset-code");
  // TODO: 后端实现后启用
  // await request.get("/users/send-reset-code", { params: { email: form.value.email.trim() } })

  codeLoading.value = true;
  isTime.value = false;
  currentTime.value = 60;

  const timer = setInterval(() => {
    currentTime.value -= 1;
    if (currentTime.value <= 0) {
      clearInterval(timer);
      isTime.value = true;
      currentTime.value = 60;
      codeLoading.value = false;
    }
  }, 1000);
};

const resetPassword = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
  } catch {
    ElMessage.warning("请完善表单信息");
    return;
  }

  submitLoading.value = true;
  try {
    ElMessage.info("后端接口待实现：POST /users/reset-password");
    // TODO: 后端实现后启用
    // await request.post("/users/reset-password", {
    //   email: form.value.email.trim(),
    //   code: form.value.code.trim(),
    //   newPassword: form.value.newPassword
    // })
  } finally {
    submitLoading.value = false;
  }
};

const goToLogin = () => {
  router.push("/login");
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
    },
  },
  particles: {
    color: { value: "#2F4F4F" },
    links: { color: "#FFFFFF", distance: 150, enable: true, opacity: 0.4, width: 1.2 },
    collisions: { enable: true },
    move: { direction: "none", enable: true, out_mode: "out", speed: 0.5 },
    number: { density: { enable: true, value_area: 800 }, value: 150 },
    opacity: { value: 0.7 },
    shape: { type: "star" },
    size: { value: { min: 1, max: 4 }, random: true },
  },
  detectRetina: true,
};
</script>

<template>
  <div class="forgot-page">
    <vue-particles id="tsparticles" class="forgot__particles" :options="options" />

    <div class="forgot-card">
      <div class="card-header">
        <div class="header-icon">🔐</div>
        <h2 class="card-title">忘记密码</h2>
        <p class="card-subtitle">页面已就绪，等待后端重置密码接口接入</p>
      </div>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-position="top"
        class="forgot-form"
        @keyup.enter="resetPassword"
      >
        <el-form-item label="邮箱地址" prop="email">
          <el-input v-model="form.email" placeholder="请输入注册邮箱" clearable size="large">
            <template #prefix>
              <el-icon><Message /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="验证码" prop="code">
          <div class="code-input-group">
            <el-input v-model="form.code" placeholder="请输入验证码" maxlength="6" clearable size="large">
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
            <el-button
              type="primary"
              native-type="button"
              :loading="codeLoading"
              :disabled="!isTime || codeLoading"
              @click="getCode"
              size="large"
              class="code-btn"
            >
              {{ isTime ? "获取验证码" : `${currentTime}s` }}
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="form.newPassword"
            type="password"
            placeholder="请输入新密码（6 到 20 位）"
            show-password
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="form.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            clearable
            size="large"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-button
          type="primary"
          native-type="button"
          :loading="submitLoading"
          @click="resetPassword"
          size="large"
          class="submit-btn"
        >
          重置密码
        </el-button>

        <div class="footer-link">
          <el-link type="warning" @click="goToLogin">想起密码了？去登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.forgot-page {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.forgot__particles {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-image: url("@/assets/loginback.jpg");
  opacity: 0.9;
  position: fixed;
  pointer-events: none;
}

.forgot-card {
  position: relative;
  z-index: 10;
  width: 440px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.header-icon {
  font-size: 40px;
  margin-bottom: 12px;
}

.card-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  color: #fff;
}

.card-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
}

.code-input-group {
  display: flex;
  gap: 12px;
  width: 100%;
}

.code-btn {
  min-width: 128px;
}

.submit-btn {
  width: 100%;
}

.footer-link {
  text-align: center;
  margin-top: 20px;
}
</style>
