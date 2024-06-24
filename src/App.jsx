import React, { useState } from "react"
import {
  Layout,
  Form,
  InputNumber,
  Select,
  Button,
  Typography,
  Space,
  Modal,
  Alert,
  Radio,
  Checkbox,
} from "antd"
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons"
import "./App.css"
import { calculateDough } from "./utils/calculateBread"
import { calculatePizza } from "./utils/calculatePizza"
import { calculateFocaccia } from "./utils/calculateFocaccia"
import { calculateBrioche } from "./utils/calculateBrioche"
import { calculateNaan } from "./utils/calculateNaan"

const { Header, Content, Footer } = Layout
const { Title } = Typography
const { Option } = Select

const App = () => {
  const [results, setResults] = useState(null)
  const [form] = Form.useForm()
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedFlourKind, setSelectedFlourKind] = useState(undefined)
  const [doughType, setDoughType] = useState("sourdough")

  const handleModalOk = () => {
    setModalVisible(false)
    setResults(null)
    form.resetFields()
  }

  const handleModalCancel = () => {
    setModalVisible(false)
  }

  const handleDoughTypeChange = (type) => {
    setDoughType(type)
    form.resetFields()
  }

  const onFinish = (values) => {
    switch (doughType) {
      case "sourdough":
        calculateDough(values, setResults, setModalVisible)
        break
      case "pizza":
        calculatePizza(values, setResults, setModalVisible)
        break
      case "focaccia":
        calculateFocaccia(values, setResults, setModalVisible)
        break
      case "brioche":
        calculateBrioche(values, setResults, setModalVisible)
        break
      case "naan":
        calculateNaan(values, setResults, setModalVisible)
        break
      default:
        console.error("Invalid dough type")
    }
  }

  const scaleRecipe = () => {
    const targetFlourWeight = form.getFieldValue("targetFlourWeight")
    if (!targetFlourWeight) return

    const currentValues = form.getFieldsValue()
    let currentTotalFlour = 0

    if (doughType === "focaccia") {
      currentTotalFlour = currentValues.flourAmount
    } else {
      currentTotalFlour = currentValues.flours.reduce(
        (sum, flour) => sum + flour.flourAmount,
        0
      )
    }

    const scaleFactor = targetFlourWeight / currentTotalFlour

    if (doughType === "focaccia") {
      form.setFieldsValue({
        flourAmount: Math.round(currentValues.flourAmount * scaleFactor),
      })
    } else {
      const scaledFlours = currentValues.flours.map((flour) => ({
        ...flour,
        flourAmount: Math.round(flour.flourAmount * scaleFactor),
      }))
      form.setFieldsValue({ flours: scaledFlours })
    }
  }

  return (
    <Layout>
      <Header
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 140,
        }}
      >
        <Title style={{ color: "white", textAlign: "center" }}>
          🥖 Bread Calculator 🍞
        </Title>
      </Header>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
        }}
      >
        <Radio.Group
          onChange={(e) => handleDoughTypeChange(e.target.value)}
          value={doughType}
          style={{ marginBottom: 20, marginTop: 20 }}
        >
          <Radio.Button value="sourdough">Sourdough Bread</Radio.Button>
          <Radio.Button value="pizza">Pizza</Radio.Button>
          <Radio.Button value="focaccia">Focaccia</Radio.Button>
          <Radio.Button value="brioche">Brioche Buns</Radio.Button>
          <Radio.Button value="naan">Naan</Radio.Button>
        </Radio.Group>

        <div className="container">
          <div className="form-box">
            <Form
              layout="vertical"
              form={form}
              onFinish={onFinish}
              initialValues={{
                flours: [
                  {
                    flourKind: undefined,
                    flourAmount: 0,
                    proteinContent: 0,
                    fiberContent: 0,
                  },
                ],
              }}
            >
              {(doughType === "sourdough" || doughType === "pizza") && (
                <Form.List name="flours">
                  {(fields, { add, remove }) => (
                    <>
                      {fields.map((field, index) => (
                        <div key={field.key} className="flour-box">
                          <Space
                            align="baseline"
                            style={{ display: "flex", marginBottom: 8 }}
                          >
                            <Form.Item
                              {...field}
                              name={[field.name, "flourKind"]}
                              fieldKey={[field.fieldKey, "flourKind"]}
                              label="Type of flour"
                              rules={[
                                {
                                  required: true,
                                  message: "Choose your flour type",
                                },
                              ]}
                            >
                              <Select
                                style={{ width: 200 }}
                                placeholder="Choose flour type"
                                onChange={() => {
                                  const currentFlours =
                                    form.getFieldValue("flours")
                                  const updatedFlours = [...currentFlours]
                                  updatedFlours[index].proteinContent =
                                    undefined
                                  form.setFieldsValue({ flours: updatedFlours })
                                }}
                              >
                                <Option value="grano duro">Durum Wheat</Option>
                                <Option value="grano tenero">Soft Wheat</Option>
                                <Option value="farina di segale">
                                  Rye Flour
                                </Option>
                                <Option value="farina di farro">
                                  Spelt Flour
                                </Option>
                                <Option value="farina di mais">Cornmeal</Option>
                                <Option value="farina di riso">
                                  Rice Flour
                                </Option>
                              </Select>
                            </Form.Item>

                            <Form.Item
                              {...field}
                              name={[field.name, "proteinContent"]}
                              fieldKey={[field.fieldKey, "proteinContent"]}
                              label="Protein Content"
                              style={{ width: 200 }}
                              rules={[
                                {
                                  required:
                                    form.getFieldValue([
                                      "flours",
                                      index,
                                      "flourKind",
                                    ]) !== "farina di mais" &&
                                    form.getFieldValue([
                                      "flours",
                                      index,
                                      "flourKind",
                                    ]) !== "farina di riso",
                                  message:
                                    "Insert your flour's protein content",
                                },
                              ]}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                placeholder="Insert protein content"
                                style={{ width: "100%" }}
                                addonAfter="%"
                                disabled={
                                  form.getFieldValue([
                                    "flours",
                                    index,
                                    "flourKind",
                                  ]) === "farina di mais" ||
                                  form.getFieldValue([
                                    "flours",
                                    index,
                                    "flourKind",
                                  ]) === "farina di riso"
                                }
                              />
                            </Form.Item>

                            <Form.Item
                              {...field}
                              name={[field.name, "fiberContent"]}
                              fieldKey={[field.fieldKey, "fiberContent"]}
                              label="Fiber Content"
                              style={{ width: 200 }}
                              rules={[
                                {
                                  required: true,
                                  message: "Insert your flour fiber content",
                                },
                              ]}
                            >
                              <InputNumber
                                min={0}
                                max={100}
                                placeholder="Insert fiber content"
                                style={{ width: "100%" }}
                                addonAfter="%"
                              />
                            </Form.Item>

                            <Form.Item
                              {...field}
                              name={[field.name, "flourAmount"]}
                              fieldKey={[field.fieldKey, "flourAmount"]}
                              label="Flour amount"
                              style={{ width: 200 }}
                              rules={[
                                {
                                  required: true,
                                  message: "Insert your flour amount in grams",
                                },
                              ]}
                            >
                              <InputNumber
                                min={0}
                                placeholder="Insert flour amount in grams"
                                style={{ width: "100%" }}
                                addonAfter="g"
                              />
                            </Form.Item>

                            {fields.length > 1 && (
                              <DeleteOutlined
                                onClick={() => remove(field.name)}
                              />
                            )}
                          </Space>
                        </div>
                      ))}

                      <Form.Item>
                        <Button
                          type="dashed"
                          onClick={() => add()}
                          block
                          icon={<PlusOutlined />}
                        >
                          Add another flour to the mix
                        </Button>
                      </Form.Item>
                    </>
                  )}
                </Form.List>
              )}

              {doughType === "focaccia" && (
                <div className="flour-box">
                  <Space
                    align="baseline"
                    style={{ display: "flex", marginBottom: 8, width: "100%" }}
                  >
                    <Form.Item
                      name="proteinContent"
                      label="Protein Content"
                      style={{ width: 200 }}
                      rules={[
                        {
                          required: true,
                          message: "Insert your flour's protein content",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder="Insert protein content"
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>
                    <Form.Item
                      name="fiberContent"
                      label="Fiber Content"
                      style={{ width: 200 }}
                      rules={[
                        {
                          required: true,
                          message: "Insert your flour's fiber content",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        placeholder="Insert fiber content"
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>
                    <Form.Item
                      name="flourAmount"
                      label="Flour Amount"
                      style={{ width: 200 }}
                      rules={[
                        {
                          required: true,
                          message: "Insert your flour amount in grams",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        placeholder="Insert flour amount in grams"
                        style={{ width: "100%" }}
                        addonAfter="g"
                      />
                    </Form.Item>
                  </Space>
                </div>
              )}

              {doughType === "brioche" && (
                <div className="flour-box">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Form.Item
                      name="briocheWeight"
                      label="Desired weight of each bun (g)"
                      initialValue={80}
                      rules={[
                        {
                          required: true,
                          message: "Please input weight of each bun",
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      name="briocheCount"
                      label="Number of buns"
                      rules={[
                        {
                          required: true,
                          message: "Please input number of buns",
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      name="hydrationPercentage"
                      label="Hydration percentage"
                      initialValue={65}
                      rules={[
                        {
                          required: true,
                          message: "Please input hydration percentage",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="fatPercentage"
                      label="Fat percentage"
                      initialValue={20}
                      rules={[
                        {
                          required: true,
                          message: "Please input fat percentage",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="fatType"
                      label="Fat type"
                      rules={[
                        { required: true, message: "Please select fat type" },
                      ]}
                    >
                      <Select>
                        <Option value="butter">Butter</Option>
                        <Option value="oil">Oil</Option>
                        <Option value="margarine">Margarine</Option>
                        <Option value="lard">Lard</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item name="includeEggs" valuePropName="checked">
                      <Checkbox>Include eggs</Checkbox>
                    </Form.Item>

                    <Form.Item
                      name="milkType"
                      label="Milk type"
                      rules={[
                        { required: true, message: "Please select milk type" },
                      ]}
                    >
                      <Select>
                        <Option value="whole">Whole milk</Option>
                        <Option value="skim">Skim milk</Option>
                        <Option value="almond">Almond milk</Option>
                        <Option value="soy">Soy milk</Option>
                        <Option value="oat">Oat milk</Option>
                      </Select>
                    </Form.Item>
                  </Space>
                </div>
              )}

              {doughType === "naan" && (
                <div className="flour-box">
                  <Space direction="vertical" style={{ width: "100%" }}>
                    <Form.Item
                      name="naanCount"
                      label="Number of Naans"
                      rules={[
                        {
                          required: true,
                          message: "Please input number of naans",
                        },
                      ]}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      name="hydrationPercentage"
                      label="Hydration percentage"
                      initialValue={60}
                      rules={[
                        {
                          required: true,
                          message: "Please input hydration percentage",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="fatPercentage"
                      label="Fat percentage"
                      initialValue={20}
                      rules={[
                        {
                          required: true,
                          message: "Please input fat percentage",
                        },
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={100}
                        style={{ width: "100%" }}
                        addonAfter="%"
                      />
                    </Form.Item>

                    <Form.Item
                      name="yogurtType"
                      label="Yogurt Type"
                      initialValue="full-fat"
                      style={{ width: 200 }}
                    >
                      <Select>
                        <Option value="none">No Yogurt</Option>
                        <Option value="full-fat">Full Fat Yogurt</Option>
                        <Option value="low-fat">Low Fat Yogurt</Option>
                        <Option value="non-fat">Non Fat Yogurt</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="liquidType"
                      label="Liquid Type"
                      initialValue="water"
                      style={{ width: 200 }}
                    >
                      <Select>
                        <Option value="water">Water</Option>
                        <Option value="whole-milk">Whole Milk</Option>
                        <Option value="skim-milk">Skim Milk</Option>
                        <Option value="almond-milk">Almond Milk</Option>
                        <Option value="soy-milk">Soy Milk</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      name="naanWeight"
                      label="Desired weight of each naan (g)"
                      initialValue={100}
                    >
                      <InputNumber min={0} style={{ width: "100%" }} />
                    </Form.Item>
                  </Space>
                </div>
              )}

              {doughType !== "brioche" && doughType !== "naan" && (
                <Form.Item name="coldProofing" valuePropName="checked">
                  <Checkbox>Second proofing in refrigerator</Checkbox>
                </Form.Item>
              )}

              <Form.Item
                name="temperature"
                label="Room temperature (°C)"
                rules={[
                  { required: true, message: "Insert your room temperature" },
                ]}
                initialValue={25}
              >
                <InputNumber
                  min={-10}
                  max={50}
                  placeholder="Insert your room temperature"
                  style={{ width: 200 }}
                  defaultValue={25}
                  addonAfter="°C"
                />
              </Form.Item>

              <Form.Item label="Scale Recipe">
                <Space>
                  <Form.Item name="targetFlourWeight" noStyle>
                    <InputNumber
                      min={1}
                      placeholder="Enter target flour weight"
                      style={{ width: 200 }}
                      addonAfter="g"
                    />
                  </Form.Item>
                  <Button onClick={scaleRecipe}>Scale Recipe</Button>
                </Space>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Calculate
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>
        Bread Calculator - Macco di Favole 2024
      </Footer>

      <Modal
        title="Results"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        style={{ gap: 20 }}
        okText="New mix"
        cancelText="Back to your mix"
      >
        {results && results.totalFlourAmount > 0 ? (
          <div className="results-box">
            <Alert
              message={`Total flour: ${results.totalFlourAmount} g`}
              type="info"
              showIcon
            />
            {doughType === "brioche" ? (
              <>
                <Alert
                  message={`Milk (${results.milkType}): ${results.totalMilk} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Fat (${results.fatType}): ${results.totalFat} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Sugar: ${results.totalSugar} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Yeast: ${results.totalYeast} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Proofing time: ${results.proofingTime}`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Eggs: ${results.eggsCount} (${results.totalEggs}g)`}
                  type="info"
                  showIcon
                />
                {results.numberOfBrioche && (
                  <Alert
                    message={`Number of brioches (${results.briocheWeight}g each): ${results.numberOfBrioche}`}
                    type="info"
                    showIcon
                  />
                )}
              </>
            ) : doughType === "naan" ? (
              <>
                <Alert
                  message={`Salt: ${results.totalSalt} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Yeast: ${results.totalYeast} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Yogurt (${results.yogurtType}): ${results.yogurtAmount} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Liquid (${results.liquidType}): ${results.totalLiquid} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Proofing time: ${results.proofingTime}`}
                  type="info"
                  showIcon
                />
                {results.numberOfNaan && (
                  <Alert
                    message={`Number of naans (${results.naanWeight}g each): ${results.numberOfNaan}`}
                    type="info"
                    showIcon
                  />
                )}
              </>
            ) : (
              <>
                <Alert
                  message={`W rating: ${results.wRating}`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Water: ${results.totalWater} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Salt: ${results.totalSalt} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`${
                    doughType === "sourdough" ? "Sourdough starter" : "Yeast"
                  }: ${results.totalYeast} g`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Proofing time: ${results.riseTime}`}
                  type="info"
                  showIcon
                />
                <Alert
                  message={`Fiber content: ${results.fiberRatio} %`}
                  type="info"
                  showIcon
                />
              </>
            )}
            <Alert
              message={`Glycemic index: ${results.glycemicIndex}`}
              type="info"
              showIcon
            />
          </div>
        ) : (
          <Alert message="Invalid Input" type="error" />
        )}
      </Modal>
    </Layout>
  )
}

export default App
